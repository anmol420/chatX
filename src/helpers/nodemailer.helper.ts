import { transporter } from "../config/nodemailer.config";

export const sendRegisterOTP = async (email: string, otp: string): Promise<void> => {
    try {
        await transporter.sendMail({
            from: '"ChatX" <testme2004.04@gmail.com>',
            to: email,
            subject: "Registration OTP",
            text: `Your OTP for registration is ${otp}.`,
        });
    } catch (error: any) {
        throw error;
    }
};

export const sendRegisterMail = async (email: string): Promise<void> => {
    try {
        await transporter.sendMail({
            from: '"ChatX" <testme2004.04@gmail.com>',
            to: email,
            subject: "Registration Success",
            text: `Registered successfully.`,
        });
    } catch (error: any) {
        throw error;
    }
};

export const sendLoginOTP = async (email: string, otp: string): Promise<void> => {
    try {
        await transporter.sendMail({
            from: '"ChatX" <testme2004.04@gmail.com>',
            to: email,
            subject: "Login OTP",
            text: `Your OTP for login is ${otp}.`,
        });
    } catch (error: any) {
        throw error;
    }
};