const http = require('http')
const os = require('os')
const fs = require('fs')

const PORT = process.env.PORT || 3000
const startedAt = new Date()

// Portainer-Run writes non-sensitive env vars to a .env file via an init
// container; sensitive ones arrive through the container environment only.
// Read both so the page can show that each path works.
function readDotEnv() {
  try {
    const out = {}
    for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
      const eq = line.indexOf('=')
      if (eq > 0) out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    }
    return out
  } catch {
    return null
  }
}

function page() {
  const dotEnv = readDotEnv()
  const greeting = process.env.GREETING || 'Hello from Portainer-Run!'
  const secretSeen = process.env.API_KEY ? 'yes (value hidden)' : 'no'
  const uptimeSec = Math.round((Date.now() - startedAt.getTime()) / 1000)

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hello-portainer-run</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
         display: grid; place-items: center; min-height: 100vh; margin: 0; }
  main { background: #1e293b; padding: 2rem 2.5rem; border-radius: 12px; max-width: 34rem; }
  h1 { margin-top: 0; color: #38bdf8; }
  td { padding: 0.25rem 0.75rem 0.25rem 0; vertical-align: top; }
  td:first-child { color: #94a3b8; white-space: nowrap; }
  code { background: #0f172a; padding: 0.1rem 0.35rem; border-radius: 4px; }
</style>
</head>
<body>
<main>
  <h1>${greeting}</h1>
  <table>
    <tr><td>Pod hostname</td><td><code>${os.hostname()}</code></td></tr>
    <tr><td>Node.js</td><td><code>${process.version}</code></td></tr>
    <tr><td>Uptime</td><td>${uptimeSec}s</td></tr>
    <tr><td>.env file present</td><td>${dotEnv ? `yes (${Object.keys(dotEnv).length} keys)` : 'no'}</td></tr>
    <tr><td>API_KEY in environment</td><td>${secretSeen}</td></tr>
  </table>
  <p>Health check: <a href="/healthz" style="color:#38bdf8">/healthz</a></p>
</main>
</body>
</html>`
}

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(page())
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`hello-portainer-run listening on port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
