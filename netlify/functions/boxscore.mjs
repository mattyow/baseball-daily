// Proxies a single game's boxscore. Only used when USE_PROXY is true in
// index.html. Kept separate from mlb.mjs so each function forwards exactly one
// upstream path and nothing else.

export default async (req) => {
  const pk = new URL(req.url).searchParams.get('gamePk');

  if (!/^\d+$/.test(pk || '')) {
    return Response.json({ error: 'gamePk must be numeric' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/game/${pk}/boxscore`,
      { headers: { accept: 'application/json' } }
    );

    if (!res.ok) {
      return Response.json({ error: `Upstream returned ${res.status}` }, { status: 502 });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=5',
        'netlify-cdn-cache-control':
          'public, s-maxage=10, stale-while-revalidate=30'
      }
    });
  } catch (err) {
    return Response.json(
      { error: `Could not reach the MLB Stats API: ${err.message}` },
      { status: 504 }
    );
  }
};

export const config = { path: '/api/mlb/boxscore' };
