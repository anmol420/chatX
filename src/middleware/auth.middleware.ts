import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";
import { eq, sql } from "drizzle-orm";

import { db } from "../db/index";
import { User, users } from "../db/schemas/schema";
import { getBlacklistToken, verifyToken } from "../helpers/jwt.helper";
import { errorResponse } from "../utils/response";

export interface AuthRequest extends Request {
    user?: User;
    token?: string;
}

export interface AuthSocket extends Socket {
    user?: User;
    token?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json(errorResponse(401, 'Access denied. No token provided.'));
        return;
    }
    const isTokenBlacklisted = await getBlacklistToken(token);
    if (isTokenBlacklisted) {
        res.status(401).json(errorResponse(401, 'Token has been revoked.'));
        return;
    }
    const decoded = verifyToken(token) as { userID: string };
    const user = await db.select().from(users).where(eq(users.id, decoded.userID));
    if (user.length === 0) {
        res.status(401).json(errorResponse(401, 'Invalid token.'));
        return;
    }
    if (!user[0].isVerified) {
        res.status(401).json(errorResponse(401, 'User Not Verified.'));
        return;
    }
    try {
        req.token = token;
        req.user = user[0];
        next();
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const socketAuth = async (req: AuthSocket, next: Function) => {
    const token = req.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    const isTokenBlacklisted = await getBlacklistToken(token);
    if (isTokenBlacklisted) {
        return next(new Error('Token has been revoked.'));
    }
    const decoded = verifyToken(token) as { userID: string };
    const user = await db.select().from(users).where(eq(users.id, decoded.userID));
    if (user.length === 0) {
        return next(new Error('Authentication error: Invalid token.'));
    }
    if (!user[0].isVerified) {
        return next(new Error('User Not Verified.'));
    }
    await db.update(users)
        .set({
            isOnline: true,
            lastSeen: sql`NOW()`,
            updatedAt: sql`NOW()`
        })
        .where(eq(users.id, user[0].id));
    try {
        req.token = token;
        req.user = {
            ...user[0],
            isOnline: true,
            lastSeen: new Date(),
        };
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'))
    }
};