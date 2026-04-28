# vturb-mcp

MCP server for the [vTurb Analytics API](https://vturb.gitbook.io/analytics-api/pt) — exposes 15 tools to query real-time and historical video analytics directly from Claude.

---

## Features

- **15 analytics tools** covering sessions, events, engagement, clicks, conversions, traffic origin and more
- **Built-in rate limiter** — token bucket enforcing the Pro tier limit of 120 req/min (no 429 errors)
- **Smart player detection** — `find_active_players` auto-discovers which video is live today
- **Per-client `.env` files** — clean credential management across multiple accounts

---

## Requirements

- Node.js ≥ 18
- A vTurb account with Analytics API access
- Your API token from [app.vturb.com/settings/analytics-api](https://app.vturb.com/settings/analytics-api)
- Claude Code (CLI or VSCode extension)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/hiperbold/vturb-mcp.git
cd vturb-mcp
npm install
npm run build
```

### 2. Create your `.env` file for each client

The MCP uses a per-client `.env` file so you can manage multiple vTurb accounts cleanly. Name the file after the client:

```bash
# Copy the example
cp .env.example .env.customer-name

# Edit and paste your token
# .env.customer-name
VTURB_API_TOKEN=your_token_here
```

The file format is simple — one variable per line:

```
VTURB_API_TOKEN=eyJ...
```

> **Security:** Never commit `.env.*` files. They are already in `.gitignore`.

### 3. Register the MCP server in Claude Code

Open `~/.claude/mcp.json` (create it if it doesn't exist) and add:

```json
{
  "mcpServers": {
    "vturb-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/vturb-mcp/dist/index.js"],
      "env": {
        "VTURB_ENV_FILE": "/absolute/path/to/vturb-mcp/.env.customer-name"
      }
    }
  }
}
```

**Windows example:**

```json
{
  "mcpServers": {
    "vturb-mcp": {
      "command": "node",
      "args": ["F:\\local-mcps\\vturb-mcp\\dist\\index.js"],
      "env": {
        "VTURB_ENV_FILE": "F:\\local-mcps\\vturb-mcp\\.env.customer-name"
      }
    }
  }
}
```

### 4. Restart Claude Code

The MCP server starts automatically on the next session. You'll see it listed in your available tools.

---

## Switching between clients

To switch accounts, just update `VTURB_ENV_FILE` in `mcp.json` to point to a different `.env` file and restart Claude:

```json
"VTURB_ENV_FILE": "F:\\local-mcps\\vturb-mcp\\.env.other-customer"
```

---

## Available Tools

### Discovery & Monitoring

| Tool | Description |
|---|---|
| `list_players` | Lists all players in the account with `id`, `name`, `duration`, and `pitch_time`. Supports optional filters by name and date range. |
| `find_active_players` | **Smart tool.** Lists all players, checks which ones have activity today, and returns only the active ones with their metadata. Use this first to discover the correct `player_id`. |
| `get_quota_usage` | Returns the current API quota status: queries used, remaining, and reset time. Use this to monitor consumption and avoid hitting the 120 req/min limit. |
| `get_live_users` | Returns the number of users currently watching, broken down by domain. Configurable time window (1–720 minutes). |

### Session Analytics

| Tool | Description |
|---|---|
| `get_session_stats` | Main analytics dashboard for a player: total views, plays, unique sessions/devices, engagement rate, clicks, conversions, and revenue in BRL/USD/EUR. |
| `get_session_stats_by_day` | Same metrics as `get_session_stats` but broken down day by day. Ideal for historical trend analysis. |

### Events

| Tool | Description |
|---|---|
| `get_events_total` | Returns totals for `started`, `finished`, and/or `viewed` events with unique session and device counts. |
| `get_events_by_day` | Same event totals broken down by day for trend analysis. |

### Engagement & Retention

| Tool | Description |
|---|---|
| `get_user_engagement` | Returns the video retention curve: how many users are still watching at each second. Also returns `average_watched_time` and `engagement_rate`. |
| `get_user_engagement_by_day` | Returns the engagement rate per day over the selected period. |

### Clicks

| Tool | Description |
|---|---|
| `get_clicks_timed` | Returns CTA click counts grouped by video second. Identifies the moment in the video that drives the most intent. |
| `get_clicks_by_day` | CTA click totals broken down by day. |

### Conversions

| Tool | Description |
|---|---|
| `get_conversions_by_day` | Conversion totals grouped by day, with unique session and device counts. |

### Traffic Origin

| Tool | Description |
|---|---|
| `get_traffic_origin_stats` | Breaks down session metrics by traffic source. Supports `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `src`, `sck`. |

### Dashboard Summary

| Tool | Description |
|---|---|
| `get_headlines_stats` | Returns a pre-computed summary (views, plays, engagement rate, clicks, and conversion rate) — the same numbers shown in the vTurb dashboard header. |

---

## Typical Workflow

```
1. find_active_players          → discover which player_id is in use today
2. get_session_stats            → get the main KPIs for a date range
3. get_user_engagement          → inspect the retention curve
4. get_clicks_timed             → find when viewers click the CTA
5. get_conversions_by_day       → track conversion trends
6. get_traffic_origin_stats     → compare traffic sources
```

---

## Rate Limiting

The client uses a **token bucket** algorithm configured for the Pro tier:

- **Limit:** 120 requests per minute
- **Refill rate:** 2 tokens per second
- **Behavior:** requests wait automatically if the bucket is empty — no errors thrown, no retries needed

Use `get_quota_usage` to check live consumption from vTurb's side.

---

## Project Structure

```
vturb-mcp/
  src/
    env.ts          — loads .env.* file at startup (via VTURB_ENV_FILE)
    client.ts       — rate-limited HTTP client (token bucket, 120 req/min)
    index.ts        — MCP server, registers all 15 tools
    tools/          — one file per tool
      list-players.ts
      find-active-players.ts
      get-quota-usage.ts
      get-session-stats.ts
      get-session-stats-by-day.ts
      get-events-total.ts
      get-events-by-day.ts
      get-user-engagement.ts
      get-user-engagement-by-day.ts
      get-clicks-timed.ts
      get-clicks-by-day.ts
      get-conversions-by-day.ts
      get-live-users.ts
      get-headlines-stats.ts
      get-traffic-origin-stats.ts
  dist/             — compiled output (run npm run build)
  .env.example      — template for creating client-specific env files
```

---

## API Reference

- [vTurb Analytics API Docs](https://vturb.gitbook.io/analytics-api/pt)
- Base URL: `https://analytics.vturb.net`
- Auth headers: `X-Api-Token` + `X-Api-Version: v1`

---

## License

MIT
