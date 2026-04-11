import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers["authorization"];
    const token = typeof authorization === "string" && authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not configured" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Extract user ID from the decoded token
    const userId = (decoded as any).userId;

    if (!userId) {
      console.error("No user ID in token payload");
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }


    req.userId = userId;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        message: "Invalid token",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
      return;
    }
    res.status(500).json({
      message: "Error processing authentication",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
    return;
  }
}