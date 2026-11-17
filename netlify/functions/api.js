const { DEFAULT_HUBS, searchNationwide, searchRegionsByKeyword } = require('../../lib/daangn');
const { guard } = require('../../lib/guard');

exports.handler = async (event) => {
  const path = event.path || '';
  const params = event.queryStringParameters || {};
  const route = path.endsWith('/search') ? 'search' : path.endsWith('/regions') ? 'regions' : 'hubs';

  const g = guard({ headers: event.headers || {}, route });
  const headers = { ...g.headers, 'Content-Type': 'application/json; charset=utf-8' };
  if (!g.ok) {
    return { statusCode: g.status, headers, body: JSON.stringify({ error: g.error }) };
  }

  try {
    if (path.endsWith('/hubs')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hubs: DEFAULT_HUBS })
      };
    }

    if (path.endsWith('/regions')) {
      const keyword = (params.q || '').trim();
      const data = await searchRegionsByKeyword(keyword);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (path.endsWith('/search')) {
      const keyword = (params.q || '').trim();
      if (!keyword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '검색어를 입력해 주세요.' })
        };
      }
      const result = await searchNationwide({
        keyword,
        hubIdParam: params.hubId,
        shardParam: params.shard,
        customHubsParam: params.customHubs,
        groupsParam: params.groups
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found' })
    };
  } catch (err) {
    console.error('[netlify api]', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다.' })
    };
  } finally {
    g.release();
  }
};
