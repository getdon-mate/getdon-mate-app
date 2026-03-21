/**
 * 로컬 개발용 CORS 프록시 서버
 *
 * 사용법:
 *   1. node scripts/dev-proxy.mjs
 *   2. .env에서 EXPO_PUBLIC_API_BASE_URL=http://localhost:3001 로 변경
 *   3. pnpm run web
 *
 * 백엔드가 CORS 헤더를 지원하지 않을 때 사용하세요.
 * 이 스크립트는 브라우저 요청을 받아 백엔드로 프록시하고 CORS 헤더를 추가합니다.
 */

import http from "node:http"
import https from "node:https"
import { URL } from "node:url"

const TARGET = process.env.PROXY_TARGET ?? "https://getdon-api.duckdns.org"
const PORT = Number(process.env.PROXY_PORT ?? 3001)

const ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

function addCorsHeaders(res, origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
  res.setHeader("Access-Control-Max-Age", "86400")
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin ?? ""
  addCorsHeaders(res, origin)

  // Preflight 요청 처리
  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  const targetUrl = new URL(req.url, TARGET)
  const isHttps = targetUrl.protocol === "https:"
  const transport = isHttps ? https : http

  console.log(`[proxy] ${req.method} ${req.url} → ${targetUrl.href}`)

  const proxyReq = transport.request(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: `${targetUrl.pathname}${targetUrl.search}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.hostname,
      },
    },
    (proxyRes) => {
      // 백엔드의 CORS 헤더는 무시하고 프록시 헤더를 사용
      const headersToForward = { ...proxyRes.headers }
      delete headersToForward["access-control-allow-origin"]
      delete headersToForward["access-control-allow-methods"]
      delete headersToForward["access-control-allow-headers"]

      res.writeHead(proxyRes.statusCode ?? 200, headersToForward)
      proxyRes.pipe(res)
    }
  )

  proxyReq.on("error", (err) => {
    console.error(`[proxy] Error: ${err.message}`)
    if (!res.headersSent) {
      res.writeHead(502)
    }
    res.end(`Proxy error: ${err.message}`)
  })

  req.pipe(proxyReq)
})

server.listen(PORT, () => {
  console.log(`\n✅ Dev CORS proxy 시작`)
  console.log(`   프록시 주소: http://localhost:${PORT}`)
  console.log(`   대상 서버:   ${TARGET}`)
  console.log(`\n📌 사용 방법:`)
  console.log(`   .env 파일에서 아래와 같이 변경하세요:`)
  console.log(`   EXPO_PUBLIC_API_BASE_URL=http://localhost:${PORT}\n`)
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다. PROXY_PORT 환경변수로 변경하세요.`)
  } else {
    console.error(`❌ 서버 에러: ${err.message}`)
  }
  process.exit(1)
})
