import { Request, Response } from "express";

import { errorResponse, successResponse } from "../utils/response";
import { userData, verifyLoginOTP, verifyRegisterOTP } from "../helpers/verifyOTP.helper";
import { userProducer } from "../utils/mq/producers/user.producer";

const verifyOTPRouteEnum = {
    REGISTER: "register",
    LOGIN: "login"
} as const;

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, route } = req.body;
    if (!email || !otp || !route) {
        res.status(400).json(errorResponse(400, 'Please provide email, otp and route'));
        return;
    }
    try {
        switch (route) {
            case verifyOTPRouteEnum.REGISTER:
                const registerValue = await verifyRegisterOTP(email, otp);
                switch (registerValue) {
                    case 404:
                        res.status(404).json(errorResponse(400, 'User not found'));
                        return;
                    case 400:
                        res.status(400).json(errorResponse(400, 'OTP mismatch'));
                        return;
                    case 200:
                        await userProducer<{ email: string }>("user.register.welcomeMessage", {
                            email: email.toLowerCase().trim(),
                        });
                        res.status(201).json(successResponse(201, 'User created', {}));
                        return;
                    case 500:
                        res.status(500).json(errorResponse(500, 'Internal server error'));
                        return;
                }
                break;
            case verifyOTPRouteEnum.LOGIN:
                const loginValue = await verifyLoginOTP(email, otp);
                switch (loginValue) {
                    case 404:
                        res.status(404).json(errorResponse(400, 'User not found'));
                        return;
                    case 400:
                        res.status(400).json(errorResponse(400, 'OTP mismatch'));
                        return;
                    case 401:
                        res.status(401).json(errorResponse(400, 'User not verified'));
                        return;
                    case 200:
                        const data = userData;
                        res.status(200).json(successResponse(200, 'Login successful', data));
                        break;
                    case 500:
                        res.status(500).json(errorResponse(500, 'Internal server error'));
                        return;
                }
                break;
            default:
                res.status(400).json(errorResponse(400, 'Please provide valid route'));
                return;
        }
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};