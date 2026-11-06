// Vercel serverless entry: serves the same Express app as `backend/server.js`.
// vercel.json rewrites /api/* and /uploads/* here; Express sees the original URL and routes it.
// (The root package.json is "type": "module", so this file is ESM; backend/ is CommonJS.)
//
// Caveats of running the backend as a serverless function (see README "Deploy to Vercel"):
// - the in-memory store is per function instance and resets on cold starts
// - uploaded photos live in /tmp, which is not shared between instances
// - Vercel limits request bodies to 4.5 MB, so keep photo uploads small
import app from '../backend/app.js';

export default app;
