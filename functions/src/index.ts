import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { stripeCheckout, stripePortal, stripeWebhook, stripeMetrics } from './stripe';
export { aiSummarizeLesson, aiStudyBuddyStream, aiCourseOutline } from './ai';
export { onUserCreated, sendCompletionEmail } from './email';
