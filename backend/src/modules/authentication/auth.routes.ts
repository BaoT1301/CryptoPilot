import { Router } from "express";
import {
  ForgotPassword,
  ResetPassword,
  RefreshTokenHandler,
  LogOut,
  DisabledUser,
} from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";

const router = Router();

/**
 * Public auth routes.
 *
 * These are exactly the flows a caller uses when it has no usable access token,
 * so requiring one is self-defeating:
 *  - /refresh is called *because* the access token expired. Gating it on a valid
 *    access token means it only works when it isn't needed.
 *  - /forgot-password and /reset-password are used by logged-out users.
 *  - /logout clears cookies; an expired session must still be able to sign out.
 *
 * Each handler authenticates by its own means -- /refresh verifies the
 * refresh_token cookie against the argon2 hash stored on the user, and
 * /reset-password verifies a signed, 5-minute reset token.
 */
router.post("/refresh", RefreshTokenHandler);
router.post("/logout", LogOut);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);

/** Protected: disabling an account requires proving who you are. */
router.put("/disable", AuthMiddleware, DisabledUser);

export default router;
