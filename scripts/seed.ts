/**
 * Seed Firestore with the canonical CourseStack demo dataset.
 *
 * Usage (against emulator):
 *   firebase emulators:start --only firestore,auth
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
 *   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *   tsx scripts/seed.ts
 *
 * Usage (against staging):
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json tsx scripts/seed.ts --env=staging
 *
 * The script is idempotent: re-running upserts the same data without duplicating.
 */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { seedCourses, seedEnrollments, seedNotes, seedProgress, seedUsers, SEED_PASSWORD } from '../src/data/seed';

const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

initializeApp(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? { credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) }
    : usingEmulator
    ? { projectId: 'coursestack-demo' }
    : { credential: applicationDefault() },
);

const db = getFirestore();
const auth = getAuth();

async function upsertUser(u: (typeof seedUsers)[number]) {
  try {
    await auth.getUser(u.id);
    await auth.updateUser(u.id, {
      email: u.email,
      displayName: u.displayName,
      password: SEED_PASSWORD,
      emailVerified: true,
    });
  } catch {
    await auth.createUser({
      uid: u.id,
      email: u.email,
      displayName: u.displayName,
      password: SEED_PASSWORD,
      emailVerified: true,
    });
  }
  await db.doc(`users/${u.id}`).set(u, { merge: true });
}

async function main() {
  console.log(`Seeding ${usingEmulator ? '[EMULATOR]' : '[REMOTE]'} project…`);
  for (const u of seedUsers) {
    await upsertUser(u);
    console.log(`  user · ${u.email} (${u.roles.join(', ')})`);
  }

  for (const c of seedCourses) {
    const cRef = db.doc(`courses/${c.id}`);
    const { modules, ...meta } = c;
    await cRef.set(meta, { merge: true });
    for (const m of modules) {
      const mRef = cRef.collection('modules').doc(m.id);
      const { lessons, ...mMeta } = m;
      await mRef.set(mMeta, { merge: true });
      for (const l of lessons) {
        await mRef.collection('lessons').doc(l.id).set(l, { merge: true });
      }
    }
    console.log(`  course · ${c.slug} (${c.totalLessons} lessons)`);
  }

  for (const e of seedEnrollments) {
    await db.doc(`users/${e.userId}/enrollments/${e.courseId}`).set(e, { merge: true });
  }
  for (const p of seedProgress) {
    await db.doc(`users/${p.userId}/progress/${p.courseId}`).set(p, { merge: true });
  }
  for (const n of seedNotes) {
    await db.doc(`users/${n.userId}/notes/${n.id}`).set(n, { merge: true });
  }

  console.log('\nSeeded users (password = "coursestack"):');
  for (const u of seedUsers) console.log(`  ${u.email}  → ${u.roles.join(', ')}, tier=${u.tier}`);
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
