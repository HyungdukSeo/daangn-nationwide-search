const http = require('http');
const fs = require('fs');
const path = require('path');
const { DEFAULT_HUBS, searchNationwide, searchRegionsByKeyword } = require('./lib/daangn');
const { guardNode } = require('./lib/guard');

const PORT = process.env.PORT || 3000;
// 기본은 본인 PC에서만 접속 가능(127.0.0.1). 외부에 열려면 HOST=0.0.0.0 으로 명시하고 API_TOKEN 등 보호 설정을 함께 사용하세요.
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || '';
  if (host.includes('daangn-nationwide-search-lby3.vercel.app')) {
    res.writeHead(308, { 'Location': `https://daangn-nationwide-search-smoky.vercel.app${req.url}` });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname.replace(/\.js$/, '');

  // 1. 기본 거점 목록 조회 API
  if (pathname === '/api/hubs') {
    const release = guardNode(req, res, 'hubs');
    if (!release) return;
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ hubs: DEFAULT_HUBS }));
    return;
  }

  // 2. 당근 동네 키워드 검색 API 프록시
  if (pathname === '/api/regions') {
    const release = guardNode(req, res, 'regions');
    if (!release) return;
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const keyword = (parsedUrl.searchParams.get('q') || '').trim();
    try {
      const data = await searchRegionsByKeyword(keyword);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (err) {
      console.error('[api/regions]', err);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '동네 검색 중 오류가 발생했습니다.' }));
    }
    return;
  }

  // 3. 전국 통합 검색 API
  if (pathname === '/api/search') {
    if (req.method === 'OPTIONS') {
      guardNode(req, res, 'hubs');
      res.writeHead(204);
      res.end();
      return;
    }
    const release = guardNode(req, res, 'search');
    if (!release) return;
    const keyword = (parsedUrl.searchParams.get('q') || '').trim();
    const hubIdParam = parsedUrl.searchParams.get('hubId');
    const shardParam = parsedUrl.searchParams.get('shard');
    const customHubsParam = parsedUrl.searchParams.get('customHubs');
    const groupsParam = parsedUrl.searchParams.get('groups');

    if (!keyword) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '검색어를 입력해 주세요.' }));
      return;
    }

    try {
      const result = await searchNationwide({ keyword, hubIdParam, shardParam, customHubsParam, groupsParam });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error('[api/search]', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '검색 중 오류가 발생했습니다.' }));
    }
    return;
  }

  // 4. 정적 파일 서빙 (public/index.html)
  const filePath = path.resolve(PUBLIC_DIR, pathname === '/' ? 'index.html' : '.' + pathname);

  if (filePath.startsWith(PUBLIC_DIR + path.sep) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain; charset=utf-8' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(` 🥕 당근 전국 통합 검색 서버가 실행되었습니다!`);
    console.log(` 👉 접속 주소: http://${HOST === '127.0.0.1' ? 'localhost' : HOST}:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = server;
