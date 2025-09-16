import jwt, { SignOptions,  } from "jsonwebtoken";

import { env, ExpiryString } from "./env.helper";

export const generateToken = (userID: string): string => {
    const options: SignOptions = {
        expiresIn: (env.JWT_EXPIRY as ExpiryString),
    }
    return jwt.sign({ userID }, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): { userID: string } | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as { userID: string};
    } catch (error) {
        return null;
    }
}