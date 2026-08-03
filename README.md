# Crypto Pilot

A crypto trading platform that runs the real mechanics on simulated money.

Live prices stream from Binance over a websocket. Orders rest on an actual order
book and match against other users, so a fill can come back partial and stay
partial. Balances follow the fill rather than the intention. An AI copilot
answers against your live positions instead of a generic prompt.

**Live:** [cryptopilot.up.railway.app](https://cryptopilot.up.railway.app)

> Funds are simulated. Prices are real, positions are not, and nothing is
> custodied.

```
crypto-pilot/
├── frontend/   React 19 · Vite 7 · TypeScript · Tailwind v4 · Motion · GSAP
└── backend/    Express 5 · TypeScript · Mongoose · Socket.IO · OpenAI
```

The two apps are independent. No npm workspace links them: each has its own
`package.json`, lockfile and deploy config, and each runs as its own Railway
service. Nothing in one build can perturb the other.

---

## What it actually does

| | |
|---|---|
| **Live market data** | Binance.US ticker stream, fanned out to every connected client over one Socket.IO server. No API key, no polling. |
| **Order book** | Limit orders rest until price reaches them. Market orders take from what is resting. |
| **Matching engine** | Matches across users. Tracks `open`, `partially_filled`, `filled` and `cancelled` as distinct states. |
| **Portfolio** | Positions valued against the live feed, derived from filled quantity rather than order size. |
| **Deposits / withdrawals** | Simulated chain confirmations, advanced by a background watcher. |
| **AI copilot** | OpenAI, prompted with your real positions and open orders. |
| **Auth** | JWT access tokens with argon2-hashed refresh tokens in httpOnly cookies. |

---

## Architecture

REST and websockets share a single HTTP server and a single port.

```
Binance ticker  ──►  backend  ──►  Socket.IO  ──►  every open tab
                        │
                        ├── REST under /api          (Express 5)
                        ├── matching engine          (in process)
                        └── MongoDB replica set      (Mongoose)
```

- REST is mounted under `/api` — `backend/src/server.ts`
- Socket.IO attaches to the same server — `backend/src/websocket/priceSocket.ts`
- The frontend sends `Authorization: Bearer <token>`; refresh and logout also
  use httpOnly cookies

**MongoDB must be a replica set.** Signup wraps user and profile creation in a
transaction, and transactions are unavailable on a standalone `mongod`. On
Railway, use the *MongoDB Single Replica* template rather than the plain MongoDB
one, and connect with `REPLICA_SET_PRIVATE_URI`.

---

## Design system

The interface is built on one idea: **the only colour on the page is the market.**

The page is paper and ink. Green and red appear only where real price data does,
so colour carries meaning instead of decoration. Amber is the single brand
accent, reserved for identity, hover and focus, and deliberately kept off the
green/red axis so a highlight can never be misread as a market signal.

| Token | Role |
|---|---|
| `--paper` / `--paper-sunk` | Warm off-white ground, never pure white |
| `--foreground` | Warm near-black ink, never pure black |
| `--brand` | Amber. Logo, hover, focus rings, marker sweep |
| `--market-up` / `--market-down` | Price moved. Nothing else may use these |
| `--asset-btc` / `-eth` / `-sol` / `-bnb` | Per-asset identity in charts and lists |

Shape rule, applied without exception: **pill buttons, 12px cards, 10px inputs.**
Type is Geist with Geist Mono for every number, always tabular so columns do not
jitter as prices tick.

Motion has to earn its place. Scroll reveals carry hierarchy, the price flash
signals a real change, and the About page pins a horizontal sequence because the
argument is literally about the states between placed and filled. Everything
collapses under `prefers-reduced-motion`.

Deliberately avoided: the dark-navy, electric-violet, neon-glow palette that
every crypto product and every AI-generated fintech page reaches for.

---

## Local development

Requires Node >= 20.

### Against the deployed backend (fastest)

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.local` is gitignored and already set up for this. It points
`VITE_API_URL` at a relative `/api`, and Vite proxies `/api` and `/socket.io` to
the deployed backend. Because the browser only ever talks to the dev server,
every request is same-origin and **CORS never applies** — you can sign in
locally without touching the backend's allow-list.

If you do not have that file:

```bash
# frontend/.env.local
VITE_API_URL=/api
VITE_DEV_API_PROXY=https://backend-production-39be5.up.railway.app
VITE_DEV_PROXY_ORIGIN=https://cryptopilot.up.railway.app
```

`VITE_DEV_PROXY_ORIGIN` makes the proxy present an origin the deployed backend
already allows. Drop it when proxying to a local backend.

### Full stack locally

```bash
# terminal 1
cd backend
cp .env.example .env       # fill in MONGO_URL and the three JWT secrets
npm install
npm run dev                # http://localhost:3000

# terminal 2
cd frontend
npm install
npm run dev                # set VITE_DEV_API_PROXY=http://localhost:3000
```

Generate each JWT secret separately. All three must be at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Environment

### Backend

| Variable | Required | Notes |
|---|:--:|---|
| `MONGO_URL` | ✓ | Replica-set connection string. `MONGO_URI` is read as a fallback. |
| `JWT_SECRET_KEY` | ✓ | ≥ 32 chars, or the app throws on sign in |
| `JWT_REFRESH_KEY` | ✓ | ≥ 32 chars |
| `RESET_PASSWORD_SECRET` | ✓ | ≥ 32 chars |
| `FRONTEND_URL` | ✓ | Allowed origins, comma separated. No trailing slash. Drives both Express CORS and Socket.IO. |
| `CROSS_SITE_COOKIES` | | `true` when frontend and backend are on different domains over HTTPS |
| `OPENAI_API_KEY` | | Without it, `POST /api/chat` returns 500. Everything else works. |
| `BINANCE_WS` | | Optional override. The default public stream needs no key. |

Do not set `PORT`. Railway injects it, and setting it manually breaks the
health check.

### Frontend

| Variable | Required | Notes |
|---|:--:|---|
| `VITE_API_URL` | ✓ | Backend base. `/api` is appended if missing. |
| `VITE_SOCKET_URL` | | Derived from `VITE_API_URL`. Only set if they diverge. |
| `VITE_BASE_PATH` | | Only for subpath hosting such as GitHub Pages. |

`VITE_*` values are inlined into the bundle at **build** time. Changing one
requires a redeploy, not a restart.

---

## Deploying to Railway

Two services from this one repo, plus a database.

1. **MongoDB Single Replica** template. The plain MongoDB template is standalone
   and signup will fail on it.
2. **Backend** — root directory `backend`, build `npm ci && npm run build`,
   start `npm start`. Set `MONGO_URL` to the replica set's
   `REPLICA_SET_PRIVATE_URI`.
3. **Frontend** — root directory `frontend`, build `npm ci && npm run build`,
   start `npm start`.

There is a circular dependency between the two: the backend needs
`FRONTEND_URL`, the frontend needs `VITE_API_URL`. Resolve it by deploying the
backend with a placeholder, deploying the frontend against it, then setting the
backend's real `FRONTEND_URL` and redeploying.

Both services build from their own Dockerfile. The frontend's accepts
`VITE_API_URL` as a build arg, since Vite needs it before `npm run build`.

---

## Scripts

```bash
# frontend
npm run dev        # dev server
npm run build      # tsc -b && vite build
npm run lint

# backend
npm run dev        # nodemon + ts-node
npm run build      # tsc
npm start          # node dist/index.js
```

---

## Known limitations

Stated plainly rather than buried:

- **Funds are simulated.** Deposits and withdrawals are advanced by a watcher
  that fakes chain confirmations. No wallet is ever touched.
- **Password reset emails go nowhere.** The mailer points at an Ethereal test
  inbox, which is a sink.
- **Avatar upload is disabled.** It used a BunnyCDN write key from client-side
  code, where any visitor could read it. It needs to move behind the backend
  before being re-enabled.
- **Order book depth is illustrative** when no counter-orders exist. Real resting
  orders replace it as soon as there are any.
- The order matching engine has rough edges around cancelling partially filled
  orders. See the issues list.
