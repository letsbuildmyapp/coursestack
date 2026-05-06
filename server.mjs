// Minimal static server for Firebase App Hosting.
// Serves the Vite build output (`dist/`) and falls back to index.html for SPA routing.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');

const app = express();

// Hashed assets — cache forever
app.use(
  '/assets',
  express.static(path.join(dist, 'assets'), {
    immutable: true,
    maxAge: '1y',
  }),
);

// Other static files (favicon, etc.) — short cache
app.use(
  express.static(dist, {
    maxAge: '1h',
    index: false,
  }),
);

// SPA fallback — every other route returns index.html, no-cache so users always pick up new deploys
app.use((_req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(dist, 'index.html'));
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`CourseStack listening on :${port}`);
});
