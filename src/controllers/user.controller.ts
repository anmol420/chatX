import { Request, Response } from "express";
import { eq, or, sql } from "drizzle-orm";

import { db, users } from "../db/index";
import { setBlacklistToken } from "../helpers/jwt.helper";
import { AuthRequest } from "../middleware/auth.middleware";
import { errorResponse, successResponse } from "../utils/response";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper";
import { generateOTP } from "../helpers/otp.helper";
import { userProducer } from "../utils/mq/producers/user.producer";
import { getSearchByUsername, setSearchByUsername } from "../helpers/cache.helper";

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
        const genOTP = generateOTP();
        await db.insert(users).values({
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hash,
            otp: genOTP,
        });
        await userProducer<{ email: string, otp: string }>("user.register.registrationOTP", {
            email: email.toLowerCase().trim(),
            otp: genOTP
        });
        res.status(200).json(successResponse(200, 'OTP sent successfully', {}));
    } catch (error) {
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
        res.status(404).json(errorResponse(404, 'User not found'));
        return;
    }
    const isMatch = comparePassword(user.password, password);
    if (!isMatch) {
        res.status(401).json(errorResponse(401, 'Invalid credentials'));
        return;
    }
    try {
        const genOTP = generateOTP();
        await db.update(users)
            .set({
                otp: genOTP,
            })
            .where(eq(users.id, user.id));
        await userProducer<{ email: string, otp: string }>("user.login.loginOTP", {
            email: email.toLowerCase().trim(),
            otp: genOTP
        });
        res.status(200).json(successResponse(200, 'OTP sent successfully', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user && req.token) {
            await setBlacklistToken(req.token);
            await db.update(users)
                .set({
                    isOnline: false,
                    lastSeen: sql`NOW()`,
                })
                .where(eq(users.id, req.user.id));
            res.status(200).json(successResponse(200, 'Logout successful', {}));
            return;
        }
        res.status(500).json(errorResponse(500, 'Unable to logout'));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const searchUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.params;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    let data = await getSearchByUsername(username);
    if (data) {
        res.status(200).json(successResponse(200, 'Search data', data));
        return;
    }
    const user = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!user) {
        res.status(404).json(errorResponse(404, 'User not found'));
        return;
    }
    try {
        data = {
            username: user.username,
            canSendFriendReq: !user.friendList.includes(username),
        };
        await setSearchByUsername(username, data);
        res.status(200).json(successResponse(200, 'Search data', data));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};