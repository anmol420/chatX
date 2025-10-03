import { connectRabbitMQ } from "../../../../config/rabbitmq.config";
import { sendRegisterMail } from "../../../../helpers/nodemailer.helper";

export const sendRegistrationMail = async (): Promise<void> => {
    try {
        const { channel } = await connectRabbitMQ();
        const exchange = "user_exchange";
        await channel.assertExchange(exchange, "topic", { durable: true });
        const queue = await channel.assertQueue("registration_mail", { durable: true });
        await channel.bindQueue(queue.queue, exchange, "user.register.welcomeMessage");
        await channel.consume(queue.queue, async (message) => {
            if (message) {
                const decodedMessage = JSON.parse(message.content.toString());
                await sendRegisterMail(decodedMessage.email);
                channel.ack(message);
            }
        }, { noAck: false });
    } catch (error) {
        throw error;
    }
};