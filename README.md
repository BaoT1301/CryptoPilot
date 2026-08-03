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
cp .env.example .env      # then fill in MONGO_URI and the three JWT secrets
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
| `MONGO_URI` | MongoDB Atlas connection string |
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

## Known issues

These are pre-existing and were **not** introduced by combining the repositories.

**Blocking a fully working deploy**

- `POST /api/auth/refresh`, `/logout`, `/forgot-password`, and `/reset-password`
  are mounted behind `AuthMiddleware` (`backend/src/server.ts:37`). Forgot-password
  is therefore unusable when logged out, and refresh fails precisely when the
  access token has expired — the only time it would be called.

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
