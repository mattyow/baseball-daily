// Proxies the MLB Stats API so the browser never makes a cross-origin call.
// Only in play when USE_PROXY is true in index.html.
//
// It also caches responses at Netlify's edge for 10 seconds, so a page open on
// three devices makes one upstream request rather than three.

const UPSTREAM = 'https://statsapi.mlb.com/api/v1/schedule';

// Only these params get forwarded — an open proxy is somebody else's problem.
const ALLOWED = ['sportId', 'startDate', 'endDate', 'date', 'hydrate', 'gameType', 'teamId'];

export default async (req) => {
  const incoming = new URL(req.url).searchParams;
  const params = new URLSearchParams();

  for (const key of ALLOWED) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }

  try {
    const res = await fetch(`${UPSTREAM}?${params}`, {
      headers: { accept: 'application/json' }
    });

    if (!res.ok) {
      return Response.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // browsers hold it 5s, the edge holds it 10s and will serve a stale
        // copy for 30s rather than fail while it refetches
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

export const config = { path: '/api/mlb' };
