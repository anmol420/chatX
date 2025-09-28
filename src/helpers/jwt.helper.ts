import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { env, ExpiryString } from "./env.helper";
import { redisConnect } from "../config/redis.config";

export const generateToken = (userID: string): string => {
    const options: SignOptions = {
        expiresIn: (env.JWT_EXPIRY as ExpiryString),
    }
    return jwt.sign({ userID }, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): { userID: string } | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as { userID: string };
    } catch (error) {
        return null;
    }
};

export const setBlacklistToken = async (token: string): Promise<void> => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        const now = Math.floor(Date.now() / 1000);
        const tokenExpiry = decoded.exp;
        if (tokenExpiry && tokenExpiry > now) {
            const ttl = tokenExpiry - now;
            if (ttl > 0) {
                await redisConnect.setBlackListToken(token, ttl);
            }
        }
    } catch (error: any) {
        throw new Error(`Failed to blacklist token: ${error.message}`);
    }
};

export const getBlacklistToken = async (token: string): Promise<boolean> => {
    try {
        return redisConnect.getBlackListToken(token);
    } catch (error: any) {
        throw new Error(`Failed to fetch blacklist token: ${error.message}`);
    }
};