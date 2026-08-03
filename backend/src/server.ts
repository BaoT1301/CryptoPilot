// Setup basic Express server + Routes

import express, { Request, Response, NextFunction } from "express";
import historyRoutes from "./modules/history/history.routes";
import cors from "cors";
import http from "http";
import { setupPriceSocket } from "./websocket/priceSocket";
import { setupOrderSocket } from "./websocket/orderSocket";
import orderRoutes from "./modules/order/order.routes";
import authRoutes from "./modules/authentication/auth.routes";
import chatRoutes from "./modules/chat/chat.routes";
import cookieParser from "cookie-parser";
import countryRoutes from "./modules/country/country.routes";
import profileRoutes from "./modules/profile/profile.routes";
import { SignUp, SignIn } from "./modules/authentication/auth.controller";
import { AuthMiddleware } from "./modules/authentication/auth.middleware";
import { depositRouter } from "./modules/deposit/deposit.routes";
import assetRoutes from "./modules/constantAssets/asset.routes";
import { startDepositWatcher } from "./modules/deposit/deposit.watcher";
import { withdrawRoute } from "./modules/withdraw/withdraw.routes";
import { startWithdrawWatcher } from "./modules/withdraw/withdraw.watcher";
import { initializeOrderBook } from "./modules/order/order.matching";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
/**
 * FRONTEND_URL accepts a comma-separated list so a local dev server can talk to
 * the deployed API. With a single hardcoded origin, `fetch` from localhost was
 * blocked while websockets still connected (the WS transport does not enforce
 * CORS the same way), which made local development look half-working: live
 * prices arrived but every authenticated request failed with "Failed to fetch".
 */
export const ALLOWED_ORIGINS = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin and non-browser callers (curl, health checks) send no Origin.
      if (!origin) return callback(null, true);
      // Reject by withholding the header, never by throwing. Throwing here goes
      // to the Express error handler and turns a disallowed origin into a 500,
      // which looks like a server fault instead of a policy decision.
      return callback(null, ALLOWED_ORIGINS.includes(origin.replace(/\/$/, "")));
    },
    credentials: true,
  })
);

// Public routes
app.post("/api/auth/register", SignUp);
app.post("/api/auth/login", SignIn);

// Routes
app.use("/api/history", historyRoutes);
// authRoutes applies AuthMiddleware per-route: /refresh, /logout,
// /forgot-password and /reset-password must stay reachable without a valid
// access token, while /disable is protected inside the router.
app.use("/api/auth", authRoutes);
app.use("/api/countries", AuthMiddleware, countryRoutes);
app.use("/api/profile", AuthMiddleware, profileRoutes);
app.use("/api/orders", AuthMiddleware, orderRoutes);
app.use("/api/deposit", AuthMiddleware, depositRouter);
app.use("/api/asset", AuthMiddleware, assetRoutes);
app.use("/api/withdraw", AuthMiddleware, withdrawRoute);
app.use("/api/chat", AuthMiddleware, chatRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

/**
 * Everything under /api answers with JSON, including failures.
 *
 * Without these, an unmatched route or an escaped error fell through to
 * Express's default handler, which replies with an HTML error page. The
 * frontend parses every response body as JSON, so an HTML reply surfaced to the
 * user as "Unexpected token '<'" rather than anything about what went wrong.
 * A bad id on GET /api/orders/:id did exactly that.
 *
 * Error bodies are also normalised to { message }, which is the single field
 * the frontend reads. Handlers previously returned { message }, { error,
 * message } and { error } alone, and that last shape left the UI with nothing
 * to display.
 */
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

app.use(
  "/api",
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = Number(err?.status || err?.statusCode) || 500;

    // Mongoose cast failures are a malformed id, which is a client error.
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid id" });
    }

    console.error("[api]", err);
    res.status(status).json({
      message:
        status === 500
          ? "Something went wrong on our side."
          : err?.message || "Request failed",
    });
  }
);

setupPriceSocket(server);
setupOrderSocket();
startDepositWatcher();
startWithdrawWatcher();

// Initialize order matching engine
initializeOrderBook().catch((err) => {
  console.error("Failed to initialize order book:", err);
});

export default server;
