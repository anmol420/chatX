import { sendRegistrationOTP } from "./user/sendRegistrationOTP.producer";
import { sendRegistrationMail } from "./user/sendRegistrationMail.producer";
import { sendLoginMailOTP } from "./user/sendLoginOTP.producer";

export const startConsumers = async () => {
    try {
        console.log("Starting Consumers!");
        await sendRegistrationOTP();
        await sendRegistrationMail();
        await sendLoginMailOTP();
    } catch (error: any) {
        throw error
    }
};