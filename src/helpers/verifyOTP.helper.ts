import { eq, sql } from "drizzle-orm";

import { db, users } from "../db";
import { generateToken } from "./jwt.helper";

export let userData: { id: string, username: string, email: string, isOnline: boolean, token: string };

export const verifyRegisterOTP = async (email: string, otp: string): Promise<number> => {
    const existsUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase().trim()),
    });
    if (!existsUser) {
        return 404;
    }
    if (existsUser.otp != otp) {
        return 400;
    }
    try {
        await db.update(users)
            .set({
                otp: '',
                isVerified: true,
            })
            .where(eq(users.id, existsUser.id));
        return 200;
    } catch (error) {
        return 500;
    }
};

export const verifyLoginOTP = async (email: string, otp: string): Promise<number> => {
    const existsUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase().trim()),
    });
    if (!existsUser) {
        return 404;
    }
    if (!existsUser.isVerified) {
        return 401;
    }
    if (existsUser.otp != otp) {
        return 400;
    }
    try {
        await db.update(users)
            .set({
                otp: '',
                isOnline: true,
                lastSeen: sql`NOW()`,
            })
            .where(eq(users.id, existsUser.id));
        const token = generateToken(existsUser.id as string);
        userData = {
            id: existsUser.id,
            username: existsUser.username,
            email: existsUser.email,
            isOnline: true,
            token: token
        };
        return 200;
    } catch (error) {
        return 500;
    }
};
