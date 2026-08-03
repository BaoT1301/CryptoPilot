import { Request, Response } from "express";
import {
  RegisterResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ForgotRequest,
  ForgotResponse,
  ResetRequest,
  ResetResponse,
  DisableUserRequest,
} from "./auth.types";
import {
  hashedString,
  htmlTemplate,
  isValidEmail,
  isValidPassword,
  refreshToken,
  resetToken,
  signToken,
  verifyHashedString,
  verifyRefreshToken,
  verifyResetToken,
  verifyToken,
} from "./auth.utils";
import { authCookieOptions, clearAuthCookieOptions } from "./auth.cookies";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../utils/sendemail";
import { get, create, update } from "./auth.service";
import { ERole } from "./auth.models";
import mongoose from "mongoose";
import Profile from "../profile/profile.model";

/**
 * Sign up a new user
 * - Validate required fields: email, password, confirmPassword
 * - Check password confirmation
 * - Hash the password
 * - Create a new user in the database (transaction)
 * - Create the user profile
 * - Generate JWT token
 *
 * @param req - Express request object containing RegisterRequest body
 * @param res - Express response object returning RegisterResponse
 */
export const SignUp = async (
  req: Request<RegisterRequest>,
  res: Response<RegisterResponse>
) => {
  // `role` is deliberately NOT read from the request body. Accepting it let any
  // caller self-register as an admin with POST /register {"role":"admin"}; the
  // issued JWT then carried role:"admin", passing Authorize(ERole.admin) and
  // exposing every user's PII via GET /api/profile. Roles are assigned
  // server-side only.
  const { email, password, confirmPassword } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });
  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email format" });
  if (!isValidPassword(password))
    return res
      .status(400)
      .json({
        message:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number",
      });
  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hashedPassword = await hashedString(password);

    const userId = uuidv4();
    const newUser = await create(
      { userId, email, password: hashedPassword, role: ERole.user },
      session
    );

    await Profile.create(
      [
        {
          userId: newUser.userId,
          firstName: email.split("@")[0],
          lastName: "",
          joinDate: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const token = signToken({
      userId: newUser.userId,
      userEmail: newUser.email,
      userName: newUser.name,
      role: newUser.role,
    });

    res.status(200).json({ message: "User Created", token });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);

    // A duplicate email is a client error, not a server fault. This previously
    // returned 500 with the raw driver text -- "E11000 duplicate key error
    // collection: ... index: email_1 ..." -- which the frontend rendered
    // straight to the user and which leaks internal schema details.
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("E11000") || raw.includes("duplicate key")) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Sign in an existing user
 * - Validate email format
 * - Find user by email
 * - Verify password
 * - Generate JWT and refresh tokens
 * - Save hashed refresh token in DB
 * - Set cookies for access and refresh tokens
 *
 * @param req - Express request object containing LoginRequest body
 * @param res - Express response object returning LoginResponse
 */
export const SignIn = async (
  req: Request<LoginRequest>,
  res: Response<LoginResponse>
) => {
  const { email, password } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  try {
    const user = await get({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const match = await verifyHashedString(user.password, password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      role: user.role,
    });
    const refreshToken_ = refreshToken({
      userId: user.userId,
      role: user.role,
      userEmail: user.email,
      userName: user.name,
    });
    user.refreshToken = await hashedString(refreshToken_);
    await user.save();

    res.cookie("access_token", token, authCookieOptions(15 * 60 * 1000));

    res.cookie(
      "refresh_token",
      refreshToken_,
      authCookieOptions(60 * 60 * 1000)
    );

    return res.status(200).json({
      token,
      message: "Login success",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Refresh the access token using a valid refresh token
 * - Check for refresh_token cookie
 * - Verify refresh token
 * - Compare with hashed token in DB
 * - Generate new access token and set cookie
 *
 * @param req - Express request object
 * @param res - Express response
 */
export const RefreshTokenHandler = async (req: Request, res: Response) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) {
    return res.status(401).json({ message: "No refresh token" });
  }
  try {
    const decoded: any = await verifyRefreshToken(refresh_token);

    const user = await get({ userId: decoded.userId });
    if (user) {
      const userRefreshToken = await verifyHashedString(
        user!.refreshToken as string,
        refresh_token
      );
      if (!userRefreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const newAccessToken = signToken({
        userId: user!.userId,
        userEmail: user!.email,
        userName: user!.name,
        role: user!.role,
      });

      res.cookie(
        "access_token",
        newAccessToken,
        authCookieOptions(15 * 60 * 1000)
      );

      res.status(200).json({ message: "Access token refreshed" });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(403)
      .json({ message: "Expired or invalid refresh token" });
  }
};

/**
 * Send password reset link to user email
 * - Validate email format
 * - Check if user exists
 * - Generate reset token and link
 * - Send email
 *
 * @param req - Express request with ForgotRequest body
 * @param res - Express response returning ForgotResponse
 */
export const ForgotPassword = async (
  req: Request<ForgotRequest>,
  res: Response<ForgotResponse>
) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid" });
  }
  const existedUser = await get({ email: email });
  if (!existedUser) {
    return res.status(404).json({ message: "Not Found" });
  }
  try {
    const resetToken_: any = resetToken({
      userId: existedUser.userId,
      userEmail: existedUser.email,
      userName: existedUser.name,
      role: existedUser.role,
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken_}`;

    await sendEmail(
      existedUser.email,
      "Reset your CryptoPilot password",
      htmlTemplate(resetLink)
    );
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Send password reset link to user email
 * - Validate email format
 * - Check if user exists
 * - Generate reset token and link
 * - Send email
 *
 * @param req - Express request with ForgotRequest body
 * @param res - Express response returning ForgotResponse
 */
export const ResetPassword = async (
  req: Request<ResetRequest>,
  res: Response<ResetResponse>
) => {
  const { token, password } = req.body;
  if (typeof password === "string" && password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const decoded = await verifyResetToken(token);

    const user = await get({ userId: decoded.userId });

    if (!user) {
      return res.status(404).json({ message: "Not Found" });
    }

    user.password = await hashedString(password);

    user.refreshToken = undefined;

    user.emailConfirm = true;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout user
 * - Invalidate refresh token in DB
 * - Clear access_token and refresh_token cookies
 *
 * @param req - Express request object
 * @param res - Express response
 */
export const LogOut = async (req: Request, res: Response) => {
  // Clearing the session must always succeed. Previously verifyToken() ran
  // inside the try *before* clearCookie, so an expired access_token -- the
  // normal state when someone logs out after 15 minutes -- threw
  // TokenExpiredError, returned 500, and left BOTH cookies in place. The user
  // could not sign out.
  try {
    const token = req.cookies?.access_token;
    if (token) {
      const decoded: any = await verifyToken(token);
      if (decoded?.userId) {
        await update(decoded.userId, { refreshToken: undefined });
      }
    }
  } catch {
    // An expired or malformed token means there is no server-side session left
    // to revoke. Fall through and clear the cookies regardless.
  }

  res.clearCookie("access_token", clearAuthCookieOptions);
  res.clearCookie("refresh_token", clearAuthCookieOptions);

  return res.status(204).send();
};

/**
 * Disable a user account
 * - Check if access_token exists
 * - Verify token and get user role
 * - Admin can disable any user, user can disable self
 *
 * @param req - Express request with DisableUserRequest body
 * @param res - Express response
 */
export const DisabledUser = async (
  req: Request<{}, {}, DisableUserRequest>,
  res: Response
) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
    const userRole = decoded.role as ERole;
    if (userRole === ERole.admin) {
      const user_ = await get({
        userId: req.body.userId,
      });
      if (!user_) {
        return res.status(404).json({ message: "Not Found" });
      }
      await update(req.body.userId!, {
        updatedBy: userRole,
        isActive: false,
      });
    } else {
      const user_ = await get({
        userId: decoded.userId,
      });
      if (!user_) {
        return res.status(404).json({ message: "Not Found" });
      }
      await update(decoded.userId, {
        updatedBy: decoded.userId,
        isActive: false,
      });
    }

    res.status(204).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};
