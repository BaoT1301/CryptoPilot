# Crypto Pilot

A crypto trading simulator: live prices, market/limit orders with a matching
engine, portfolio tracking, simulated deposits/withdrawals, and an AI chat
assistant.

This repository combines what were previously two separate repositories
(`crypto-pilot-fe` and `crypto-pilot-be`) into a single deployable monorepo.

```
crypto-pilot/
├── frontend/   React 19 + Vite 7 + TypeScript + Tailwind v4 SPA
└── backend/    Express 5 + TypeScript + Mongoose (MongoDB Atlas) + Socket.IO
```

The two apps are independent — there is no npm workspace linking them. Each has
its own `package.json`, lockfile, and deploy config, and each is deployed as its
own Railway service.

---

## Architecture

The backend serves the REST API and the websocket feed **on the same port**.

- REST is mounted under `/api` (`backend/src/server.ts`).
- Socket.IO attaches to the same HTTP server (`backend/src/websocket/priceSocket.ts`).
- Live prices come from the public Binance.US ticker stream — no API key needed.
- Auth is JWT. The frontend sends `Authorization: Bearer <token>`; refresh and
  logout additionally rely on httpOnly cookies.

---

## Local development

Requires Node >= 20 and a MongoDB connection string.

**Backend** (terminal 1):

```bash
cd backend
cp .env.example .env      # then fill in MONGO_URL and the three JWT secrets
npm install
npm run dev               # http://localhost:3000
```

Generate each JWT secret (all three must be at least 32 characters):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Frontend** (terminal 2):

```bash
cd frontend
cp .env.example .env      # set VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173
```

For local development leave `CROSS_SITE_COOKIES` unset in the backend `.env`,
and set `FRONTEND_URL=http://localhost:5173`.

### Running the frontend against the deployed API

Useful when you only want to work on the UI. Create `frontend/.env.local`
(gitignored):

```
VITE_API_URL=/api
VITE_DEV_API_PROXY=https://your-backend.up.railway.app
VITE_DEV_PROXY_ORIGIN=https://your-frontend.up.railway.app
```

A relative `VITE_API_URL` means the browser only ever talks to the dev server,
so requests are same-origin and CORS does not apply. Vite proxies `/api` and
`/socket.io` to the target, and presents `VITE_DEV_PROXY_ORIGIN` as the Origin
so the deployed backend accepts them.

Without this, pointing `VITE_API_URL` straight at the deployed API produces a
confusing half-working state: live prices arrive, because the websocket
transport does not enforce CORS the way an XHR does, while every authenticated
request fails with "Failed to fetch".

`FRONTEND_URL` on the backend also accepts a comma-separated list, which is the
alternative if you would rather allow the dev origin server-side.

---

## Deploying to Railway

Create **two services in one Railway project**, both pointing at this repo.

### Backend service

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |

Environment variables — see `backend/.env.example` for the full annotated list:

| Variable | Notes |
|---|---|
| `MONGO_URL` | MongoDB connection string. On Railway: `${{MongoDB.MONGO_URL}}` |
| `JWT_SECRET_KEY` | >= 32 chars, else the app throws on login |
| `JWT_REFRESH_KEY` | >= 32 chars |
| `RESET_PASSWORD_SECRET` | >= 32 chars |
| `FRONTEND_URL` | Exact frontend origin, no trailing slash |
| `CROSS_SITE_COOKIES` | `true` — required when the two services are on different domains |
| `OPENAI_API_KEY` | Required for `POST /api/chat` |
| `MAIL_FROM_NAME` / `MAIL_FROM_EMAIL` | Optional |
| `BINANCE_WS` | Optional, has a working default |

Do **not** set `PORT` — Railway injects it, and the app already reads
`process.env.PORT`.

### Frontend service

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |

Environment variables (these are **build-time** — changing one requires a
redeploy, and all of them end up publicly readable in the JS bundle):

| Variable | Notes |
|---|---|
| `VITE_API_URL` | `https://<backend>.up.railway.app/api` — must include `/api` |

### Deploy order

There is a circular dependency: the backend needs `FRONTEND_URL` and the
frontend needs `VITE_API_URL`. Resolve it like this:

1. Deploy the backend first, with a placeholder `FRONTEND_URL`.
2. Generate its public domain, then deploy the frontend with `VITE_API_URL`
   pointed at it.
3. Generate the frontend domain, set it as the backend's real `FRONTEND_URL`,
   and redeploy the backend.

MongoDB Atlas must allow inbound connections from Railway — Railway does not
publish static egress IPs on the default plan, so the Atlas network access list
generally needs `0.0.0.0/0`.

---

## Design system

The UI runs on one system, documented at the top of `frontend/src/index.css`.

**Colour is data.** The page is warm paper and ink. There are exactly three
chromatic values and each has one job: brand amber for identity and
interaction, market green for price up, market red for price down. Per-asset
marks (`--asset-btc` and friends) identify a series. Nothing else is allowed to
be chromatic, which is deliberately the inverse of the category default of dark
navy, electric violet and neon glow.

**Shape.** Buttons are full pill, cards 12px, inputs 10px. Applied everywhere.

**Type.** Geist and Geist Mono, self-hosted. Display weight 400 with tracking
around -0.03em. Every number is mono with tabular figures, so columns do not
jitter as prices tick.

**Motion** is motivated or absent. A price flashes because the price changed; a
sparkline moves because data moved. Everything collapses under
`prefers-reduced-motion`.

**Each page owns its composition.** The language is shared, the layouts are
not: the landing page is an asymmetric hero with a live market panel, About is
a scroll-pinned horizontal sequence plus an annotated schematic, Dashboard is a
readout with a chart and a hairline ledger, Trading is a three-column terminal
with a depth-weighted book, Chat is a single conversation column.

---

## Known issues

These are pre-existing and were **not** introduced by combining the repositories.

**Security**

- `frontend/src/utils/bunnyUpload.ts` sends a BunnyCDN storage **write** key from
  client-side code. Any `VITE_*` value is public in the bundle. Rotate any key
  ever used there, and move uploads behind a backend endpoint.
- `backend/src/utils/sendemail.ts` hardcodes Ethereal test SMTP credentials in
  source. Mail is captured by a sink and never reaches real inboxes.

**Stability / hygiene**

- `backend/src/websocket/priceSocket.ts` re-creates the entire Socket.IO server on
  every Binance reconnect, leaking an instance and a connection handler each time;
  already-connected clients stop receiving price updates.
- The price socket logs once per tick per asset, which will flood Railway logs.
- `crypto@^1.0.1` in `backend/package.json` is a deprecated npm squatter package,
  not Node's builtin.
- `backend/docker-compose.yml` maps host `5001` to container `5000`, but the app
  listens on `PORT` (default 3000). Compose is unused for the Railway deploy.
