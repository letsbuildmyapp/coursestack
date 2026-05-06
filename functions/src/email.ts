import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { Resend } from 'resend';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';

const RESEND_KEY = defineSecret('RESEND_API_KEY');
const FROM_EMAIL = defineSecret('EMAIL_FROM');
const APP_URL = defineSecret('APP_URL');

function r() {
  return new Resend(RESEND_KEY.value());
}

interface UserDoc {
  email: string;
  displayName: string;
  tier?: string;
}

const wrap = (children: React.ReactNode) =>
  React.createElement(
    'div',
    { style: { fontFamily: 'Inter, sans-serif', maxWidth: 560, margin: '0 auto', color: '#272239' } },
    React.createElement(
      'h1',
      { style: { fontFamily: 'Fraunces, serif', fontSize: 28, lineHeight: 1.2, color: '#272239' } },
      'CourseStack',
    ),
    children,
    React.createElement(
      'p',
      { style: { color: '#7c7884', fontSize: 12, marginTop: 32 } },
      `Set in Fraunces & Inter. CourseStack — A reading-room for working professionals.`,
    ),
  );

function welcomeHtml(name: string, appUrl: string) {
  const body = React.createElement(
    React.Fragment,
    null,
    React.createElement('p', null, `Welcome, ${name}.`),
    React.createElement(
      'p',
      null,
      'Six new courses every quarter. The first lesson of every course is free — start anywhere.',
    ),
    React.createElement(
      'a',
      {
        href: `${appUrl}/catalog`,
        style: {
          display: 'inline-block',
          padding: '12px 18px',
          background: '#272239',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 6,
          marginTop: 16,
          fontWeight: 500,
        },
      },
      'Open the catalog →',
    ),
  );
  return renderToStaticMarkup(wrap(body));
}

function completionHtml(name: string, courseTitle: string, certUrl: string) {
  const body = React.createElement(
    React.Fragment,
    null,
    React.createElement('p', null, `${name} — you finished ${courseTitle}. Quietly remarkable.`),
    React.createElement(
      'a',
      {
        href: certUrl,
        style: { display: 'inline-block', padding: '12px 18px', background: '#a85b32', color: '#fff', textDecoration: 'none', borderRadius: 6, marginTop: 16, fontWeight: 500 },
      },
      'View your certificate →',
    ),
  );
  return renderToStaticMarkup(wrap(body));
}

export const onUserCreated = onDocumentCreated(
  { document: 'users/{userId}', secrets: [RESEND_KEY, FROM_EMAIL, APP_URL] },
  async (event) => {
    const data = event.data?.data() as UserDoc | undefined;
    if (!data?.email) return;
    try {
      await r().emails.send({
        from: FROM_EMAIL.value(),
        to: data.email,
        subject: 'Welcome to CourseStack',
        html: welcomeHtml(data.displayName ?? 'there', APP_URL.value()),
      });
    } catch (e) {
      logger.error('Welcome email failed', e);
    }
  },
);

export const sendCompletionEmail = onCall({ secrets: [RESEND_KEY, FROM_EMAIL, APP_URL] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in.');
  const { courseTitle, courseId } = req.data as { courseTitle: string; courseId: string };
  const certUrl = `${APP_URL.value()}/certificates/${req.auth.uid}/${courseId}`;
  await r().emails.send({
    from: FROM_EMAIL.value(),
    to: req.auth.token.email!,
    subject: `You finished ${courseTitle}.`,
    html: completionHtml(req.auth.token.name ?? 'reader', courseTitle, certUrl),
  });
  return { ok: true };
});
