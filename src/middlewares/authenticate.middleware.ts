import type { Response, NextFunction } from "express";

import type { AuthRequest } from "../models/auth.model";
export type { AuthRequest } from "../models/auth.model";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1]!;

  const payload = verifyAccessToken(token);

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
};
