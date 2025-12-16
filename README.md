# tma-currency

Telegram Mini App for currency exchange rates.

## Structure

```text
├── mini-app/   # React frontend (Vite + Telegram SDK)
└── server/     # Fastify API (Vercel Serverless, free tier)
```

## Requirements

- Node.js 20.x
- pnpm 10.x

## Installation

```bash
pnpm install
```

## Development

```bash
# Mini App (https://localhost:5173)
pnpm dev

# Server (http://localhost:3000)
pnpm dev:server
```

## Environment

Copy example files and fill in values:

```bash
cp mini-app/.env.example mini-app/.env
cp server/.env.example server/.env.development
```

See `mini-app/README.md` and `server/README.md` for variable details.
