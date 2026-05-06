import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import Stripe from 'stripe';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const STRIPE_SECRET = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const STRIPE_PRICE_PRO = defineSecret('STRIPE_PRICE_PRO');
const STRIPE_PRICE_TEAM = defineSecret('STRIPE_PRICE_TEAM');
const APP_URL = defineSecret('APP_URL');

function client() {
  return new Stripe(STRIPE_SECRET.value(), { apiVersion: '2024-09-30.acacia' });
}

const TIER_PRICES: Record<string, () => string> = {
  pro: () => STRIPE_PRICE_PRO.value(),
  team: () => STRIPE_PRICE_TEAM.value(),
};

export const stripeCheckout = onCall(
  { secrets: [STRIPE_SECRET, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, APP_URL] },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
    const { tier } = req.data as { tier: 'pro' | 'team' };
    const priceFn = TIER_PRICES[tier];
    if (!priceFn) throw new HttpsError('invalid-argument', 'Unknown tier.');

    const db = getFirestore();
    const userRef = db.doc(`users/${req.auth.uid}`);
    const snap = await userRef.get();
    const data = snap.data() ?? {};
    let customerId = data.stripeCustomerId as string | undefined;

    const stripe = client();
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.auth.token.email ?? undefined,
        name: data.displayName ?? undefined,
        metadata: { firebaseUid: req.auth.uid },
      });
      customerId = customer.id;
      await userRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceFn(), quantity: 1 }],
      success_url: `${APP_URL.value()}/account/billing?status=success`,
      cancel_url: `${APP_URL.value()}/account/billing?status=cancel`,
      allow_promotion_codes: true,
      subscription_data: { metadata: { firebaseUid: req.auth.uid, tier } },
      metadata: { firebaseUid: req.auth.uid, tier },
    });
    return { url: session.url };
  },
);

export const stripePortal = onCall({ secrets: [STRIPE_SECRET, APP_URL] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const db = getFirestore();
  const snap = await db.doc(`users/${req.auth.uid}`).get();
  const customerId = snap.get('stripeCustomerId') as string | undefined;
  if (!customerId) throw new HttpsError('failed-precondition', 'No Stripe customer.');
  const stripe = client();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL.value()}/account/billing`,
  });
  return { url: session.url };
});

// Webhook — must use raw body
export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET], cors: false },
  async (req, res) => {
    const stripe = client();
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig as string, STRIPE_WEBHOOK_SECRET.value());
    } catch (err: any) {
      logger.error('Webhook signature verification failed', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const db = getFirestore();
    // Idempotency
    const eventRef = db.doc(`stripeEvents/${event.id}`);
    if ((await eventRef.get()).exists) {
      res.json({ received: true, duplicate: true });
      return;
    }
    await eventRef.set({ type: event.type, createdAt: FieldValue.serverTimestamp() });

    async function flipFromSubscription(sub: Stripe.Subscription) {
      const uid = (sub.metadata?.firebaseUid as string | undefined) ?? null;
      const tier = (sub.metadata?.tier as 'pro' | 'team' | undefined) ?? 'pro';
      if (!uid) return;
      const status = sub.status === 'active' || sub.status === 'trialing' ? sub.status : sub.status;
      await db.doc(`users/${uid}`).set(
        {
          tier,
          subscriptionStatus: status,
          currentPeriodEnd: sub.current_period_end * 1000,
          stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        },
        { merge: true },
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await flipFromSubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await flipFromSubscription(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
        if (!userSnap.empty) {
          await userSnap.docs[0]!.ref.set({ subscriptionStatus: 'past_due' }, { merge: true });
        }
        break;
      }
      default:
        logger.info('Unhandled Stripe event', event.type);
    }

    res.json({ received: true });
  },
);

// Cached Stripe metrics for the admin dashboard
export const stripeMetrics = onCall({ secrets: [STRIPE_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in.');
  const db = getFirestore();
  const userSnap = await db.doc(`users/${req.auth.uid}`).get();
  if (!(userSnap.get('roles') as string[] | undefined)?.includes('admin')) {
    throw new HttpsError('permission-denied', 'Admins only.');
  }

  const cacheRef = db.doc('metrics/stripe');
  const cached = await cacheRef.get();
  const FIVE_MIN = 5 * 60 * 1000;
  if (cached.exists && Date.now() - (cached.get('at') as number) < FIVE_MIN) {
    return cached.get('payload');
  }
  const stripe = client();
  // simplified: list active subs
  const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
  const mrr = subs.data.reduce((acc, s) => {
    const item = s.items.data[0];
    return acc + ((item?.price.unit_amount ?? 0) / 100);
  }, 0);
  const payload = { mrr, activeCount: subs.data.length, at: Date.now() };
  await cacheRef.set(payload);
  return payload;
});
