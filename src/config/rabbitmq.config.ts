import { Channel, ChannelModel, connect } from "amqplib";

import { env } from "../helpers/env.helper";

export const connectRabbitMQ = async (): Promise<{ connection: ChannelModel; channel: Channel }> => {
    const connection: ChannelModel = await connect({
        username: env.RABBITMQ_USER,
        password: env.RABBITMQ_PASSWORD,
    });
    const channel = await connection.createChannel();
    return { connection: connection, channel: channel };
};