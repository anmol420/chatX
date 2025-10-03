import { connectRabbitMQ } from "../../../../config/rabbitmq.config";
import { sendLoginOTP } from "../../../../helpers/nodemailer.helper";

export const sendLoginMailOTP = async (): Promise<void> => {
    try {
        const { channel } = await connectRabbitMQ();
        const exchange = "user_exchange";
        await channel.assertExchange(exchange, "topic", { durable: true });
        const queue = await channel.assertQueue("login_otp", { durable: true });
        await channel.bindQueue(queue.queue, exchange, "user.login.loginOTP");
        await channel.consume(queue.queue, async (message) => {
            if (message) {
                const decodedMessage = JSON.parse(message.content.toString());
                await sendLoginOTP(decodedMessage.email, decodedMessage.otp);
                channel.ack(message);
            }
        }, { noAck: false });
    } catch (error) {
        throw error;
    }
};