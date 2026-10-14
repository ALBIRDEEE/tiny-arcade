// Tiny Arcade shared game server: Node.js 18+, no packages required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3000);
const SECRET = process.env.ARCADE_SECRET || 'CHANGE-ME-123';
const clients = new Set();
const game = { x: 450, y: 280, coinX: 650, coinY: 200, score: 0, move: 0, active: false };
let lastInput = 0;
function newCoin() {
  game.coinX = 35 + Math.round(Math.random() * 830);
  game.coinY = 95 + Math.round(Math.random() * 420);
}
function send(res, status, contentType, body) {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return send(res, 200, 'text/html; charset=utf-8', fs.readFileSync(path.join(__dirname, 'index.html')));
  }
  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache, no-transform', 'Connection':'keep-alive', 'X-Accel-Buffering':'no' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/input') {
    if (url.searchParams.get('key') !== SECRET) return send(res, 403, 'text/plain', 'Wrong secret');
    let body = '';
    req.on('data', part => { body += part; if (body.length > 1000) req.destroy(); });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const move = Number(params.get('move') || 0);
      if (!Number.isInteger(move) || move < 0 || move > 15) return send(res, 400, 'text/plain', 'Bad controls');
      game.move = move;
      game.active = true;
      lastInput = Date.now();
      send(res, 200, 'text/plain', 'OK');
    });
    return;
  }
  send(res, 404, 'text/plain', 'Not found');
});
let prev = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = Math.min((now - prev) / 1000, 0.10);
  prev = now;
  if (now - lastInput > 3000) { game.move = 0; game.active = false; }
  let dx = 0, dy = 0;
  if (game.move & 1) dy -= 1; // up
  if (game.move & 2) dy += 1; // down
  if (game.move & 4) dx -= 1; // left
  if (game.move & 8) dx += 1; // right
  const length = Math.hypot(dx,dy) || 1;
  game.x = Math.max(22, Math.min(878, game.x + (dx / length) * 230 * dt));
  game.y = Math.max(91, Math.min(542, game.y + (dy / length) * 230 * dt));
  if (Math.hypot(game.x - game.coinX, game.y - game.coinY) < 36) { game.score += 1; newCoin(); }
  const packet = `data: ${JSON.stringify(game)}\n\n`;
  for (const client of clients) { try { client.write(packet); } catch { clients.delete(client); } }
}, 50);
server.listen(PORT, '0.0.0.0', () => console.log(`Tiny Arcade listening on port ${PORT}`));
