# @tma-currency/mini-app

React frontend for TMA Exchange Rate.

## Stack

- React 19 + Vite
- Reatom (state management)
- Telegram Mini Apps SDK

## Development

```bash
pnpm dev
```

Runs at `https://localhost:5173` (HTTPS required for Telegram).

## Environment

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Server API URL |

## Vercel Deployment

1. Create new project in Vercel
2. Set **Root Directory** to `mini-app`
3. Framework: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = your deployed server URL
5. Deploy
