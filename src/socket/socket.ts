import { Server } from "socket.io";

import { AuthSocket } from "../middleware/auth.middleware";

export const handleSocketConnection = async (io: Server, socket: AuthSocket) => {};