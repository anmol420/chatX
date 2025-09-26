import "./config/env.config";

import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";

import { socketAuth } from "./middleware/auth.middleware";
import { handleSocketConnection } from "./socket/socket";
import { env } from "./helpers/env.helper";

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

server.listen(env.PORT, () => {
    console.log(`Server running on port: ${env.PORT}`);
    console.log(`Socket.io server ready!`);
});