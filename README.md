# Out of Town Scoreboard

Every live MLB game on one screen: teams, inning, score, plus pitcher, batter,
count, outs and runners on base. Styled after an outfield out-of-town board.

Single static file, no build step, no dependencies. Data comes from MLB's
public Stats API, polled every 15 seconds.

## Run it locally

Open `index.html` in a browser. That's the whole thing.

For the Netlify function to work locally you need the CLI:

```bash
npm install -g netlify-cli
netlify dev
```

## Deploy

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the
   repo, and deploy. `netlify.toml` already sets publish directory and functions
   path, so leave the build settings empty.
3. Every push to `main` redeploys.

## If the board shows "Can't reach the wire"

Open the browser console. A CORS error means the direct API call was blocked.
Set `USE_PROXY = true` near the top of the script in `index.html` and push —
requests then route through `netlify/functions/mlb.mjs`, which fetches
server-side and caches for 10 seconds at the edge.

Any other error is the API itself; the board retries on its own every 15s.

## What the panels show

| Element | Meaning |
| --- | --- |
| Amber dot | Game in progress |
| `TOP 7` / `MIDDLE 7` | Half-inning. "Middle"/"End" means teams are changing sides, so there's no batter or count. |
| `EXTRAS` chip | Past the scheduled inning count |
| `FINAL / 11` | Final, went 11 innings |
| `GAME 1` / `GAME 2` | Doubleheader, traditional or split |
| Rust left edge | Delayed, postponed or suspended, with the reason |
| Diamond | Runners on base |
| Three lamps | Outs |
| Brighter team name | Currently batting |

Spring training and exhibition games are filtered out. Regular season and
postseason both appear.

## Notes

The board queries a two-day Eastern window and keeps yesterday's games only
while they're unresolved, so a late West Coast game in the 14th doesn't vanish
at midnight ET.

MLB's Stats API is undocumented and unofficial. Fine for personal use; it has
no uptime guarantee and no terms permitting commercial use.
