# @tma-currency/server

Fastify API for TMA Exchange Rate (Vercel Serverless, free tier).

## Development

```bash
pnpm dev
```

Runs at `http://localhost:3000`.

## Environment

```bash
cp .env.example .env.development
```

| Variable | Description |
|----------|-------------|
| `API_URL` | `https://api.freecurrencyapi.com/v1` |
| `API_KEY` | Key from [FreeCurrencyAPI](https://freecurrencyapi.com/) |
| `BOT_TOKEN` | Token from [@BotFather](https://t.me/BotFather) |

## Vercel Deployment

1. Create new project in Vercel
2. Set **Root Directory** to `server`
3. Framework: **Other**
4. Add environment variables:
   - `API_URL`
   - `API_KEY`
   - `BOT_TOKEN`
5. Deploy

All routes are handled by `/api/index.js` via `vercel.json` rewrites.
