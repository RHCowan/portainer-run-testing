# hello-portainer-run

Minimal test app for Portainer-Run. Plain Node.js (no dependencies), listens on
port 3000, serves a status page at `/` and JSON at `/healthz`.

What it exercises in Portainer-Run:

- Runtime detection: `package.json` → Node.js 22, start command `npm start`
- Dependency init container: `npm install --production` (trivially, no deps)
- `.env.example` flow: `GREETING` is non-sensitive (committed `.env`),
  `API_KEY` matches the sensitive pattern (Kubernetes Secret via env)

The status page reports the pod hostname, whether the generated `.env` file is
present, and whether `API_KEY` arrived via the container environment — so you
can verify both env-var paths at a glance.

Run locally: `npm start` then open http://localhost:3000
