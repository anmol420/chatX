import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";

import { verifyToken } from "../helpers/jwt.helper";
import { User, IUser } from "../models/User";

export interface AuthRequest extends Request {
    user?: IUser;
}

export interface AuthSocket extends Socket {
    user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Access denied. No token provided.' });
            return;
        }
        const decoded = verifyToken(token) as { userID: string };
        const user = await User.findById(decoded.userID);
        if (!user) {
            res.status(401).json({ error: 'Invalid token.' });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
    }
};

export const socketAuth = async (req: AuthSocket, next: Function) => {
    try {
        const token = req.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        const decoded = verifyToken(token) as { userID: string };
        const user = await User.findById(decoded.userID);
        if (!user) {
            return next(new Error('Authentication error: Invalid token'));
        }
        await User.findByIdAndUpdate(user._id, {
            isOnline: true,
            lastSeen: new Date()
        });
        req.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'))
    }
};