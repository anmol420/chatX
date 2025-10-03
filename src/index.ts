import "./config/env.config";

import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";

import { socketAuth } from "./middleware/auth.middleware";
import { handleSocketConnection } from "./socket/socket";
import { env } from "./helpers/env.helper";
import { redisConnect } from "./config/redis.config";
import { startConsumers } from "./utils/mq/consumers";

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

io.use(socketAuth);
io.on('connection', (socket) => {
    handleSocketConnection(io, socket);
});

startConsumers()
    .then(() => {
        redisConnect.connect()
            .then(() => {
                server.listen(env.PORT, () => {
                    console.log(`Server running on port: ${env.PORT}`);
                    console.log(`Socket.io server ready!`);
                });
            })
            .catch((e: any) => {
                console.log(e.message);
                process.exit(0);
            });
    })
    .catch(() => {
        console.log('Error in connecting to RabbitMQ!');
        process.exit(0);
    });

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await redisConnect.disconnect();
    process.exit(0);
});