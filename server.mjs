import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, 'site')
const PORT = Number(process.env.PORT || 8090)
const HOST = '127.0.0.1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const full = path.join(ROOT, normalized)
  return full.startsWith(ROOT) ? full : null
}

const server = http.createServer((req, res) => {
  let target = safePath(req.url === '/' ? '/index.html' : req.url)

  if (!target) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html')
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }

    const type = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache'
    })
    res.end(data)
  })
})

server.listen(PORT, HOST, () => {
  console.log(`\n  Lüyuan Smart website\n  http://${HOST}:${PORT}/\n  Press Ctrl+C to stop.\n`)
})
