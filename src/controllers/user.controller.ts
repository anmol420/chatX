import { Request, Response } from "express";
import { eq, or, sql } from "drizzle-orm";

import { db, users } from "../db/index";
import { generateToken } from "../helpers/jwt.helper";
import { AuthRequest } from "../middleware/auth.middleware";
import { errorResponse, successResponse } from "../utils/response";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper";

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json(errorResponse(400, 'Please provide username, email, and password'));
        return;
    }
    const existingUser = await db.query.users.findFirst({ 
        where: or(
            eq(users.username, username.toLowerCase().trim()), 
            eq(users.email, email.toLowerCase().trim())
        ) 
    });
    if (existingUser) {
        res.status(400).json(errorResponse(400, 'User with this email or username already exists'));
        return;
    }
    const hash = await hashPassword(password);
    if (hash === null) {
        res.status(400).json(errorResponse(500, 'Hashing failed'));
        return;
    }
    try {
        await db.insert(users).values({
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hash,
        });
        res.status(201).json(successResponse(201, 'User created', {}));
    } catch (error) {
        console.log(error);
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json(errorResponse(400, 'Please provide email and password'));
        return;
    }
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase().trim())
    });
    if (!user) {
        res.status(404).json(errorResponse(400, 'User not found'));
        return;
    }
    const isMatch = comparePassword(user.password, password);
    if (!isMatch) {
        res.status(401).json(errorResponse(400, 'Invalid credentials'));
        return;
    }
    try {
        await db.update(users)
            .set({
                isOnline: true,
                lastSeen: sql`NOW()`,
            })
            .where(eq(users.id, user.id));
        const token = generateToken(user.id as string);
        res.status(200).json(successResponse(200, 'Login successful', {
            id: user.id,
            username: user.username,
            email: user.email,
            isOnline: true,
            token: token,
        }));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user) {
            await db.update(users)
                .set({
                    isOnline: false,
                    lastSeen: sql`NOW()`,
                })
                .where(eq(users.id, req.user.id));
        }
        res.status(200).json(successResponse(200, 'Logout successful', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};