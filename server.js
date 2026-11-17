const http = require('http');
const fs = require('fs');
const path = require('path');
const { DEFAULT_HUBS, searchNationwide, searchRegionsByKeyword } = require('./lib/daangn');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. 기본 거점 목록 조회 API
  if (parsedUrl.pathname === '/api/hubs') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ hubs: DEFAULT_HUBS }));
    return;
  }

  // 2. 당근 동네 키워드 검색 API 프록시
  if (parsedUrl.pathname === '/api/regions') {
    const keyword = (parsedUrl.searchParams.get('q') || '').trim();
    try {
      const data = await searchRegionsByKeyword(keyword);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. 전국 통합 검색 API
  if (parsedUrl.pathname === '/api/search') {
    const keyword = (parsedUrl.searchParams.get('q') || '').trim();
    const customHubsParam = parsedUrl.searchParams.get('customHubs');
    const groupsParam = parsedUrl.searchParams.get('groups');

    if (!keyword) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '검색어를 입력해 주세요.' }));
      return;
    }

    try {
      const result = await searchNationwide({ keyword, customHubsParam, groupsParam });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4. 정적 파일 서빙 (public/index.html)
  const filePath = parsedUrl.pathname === '/'
    ? path.join(__dirname, 'public', 'index.html')
    : path.join(__dirname, 'public', parsedUrl.pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
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
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🥕 당근 전국 통합 검색 서버가 실행되었습니다!`);
  console.log(` 👉 접속 주소: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
