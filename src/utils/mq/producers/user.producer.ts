import { connectRabbitMQ } from "../../../config/rabbitmq.config";

export const userProducer = async <T>(routingKey: string, message: T): Promise<void> => {
    try {
        const { channel, connection } = await connectRabbitMQ();
        const exchange = "user_exchange";
        await channel.assertExchange(exchange, "topic", { durable: true });
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        throw error;
    }
};
