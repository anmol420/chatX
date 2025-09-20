import express from "express";
import cors from "cors";

import { env } from "./helpers/env.helper";
import userRoutes from "./routes/user.route";
import { errorResponse } from "./utils/response";

const app = express();

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/v1/health', (_, res) => {
    res.json({
        status: 'OK',
        message: 'Chat server is running',
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1/auth", userRoutes);

app.use((_, res) => {
    res.status(404).json(errorResponse(404, 'Page Not Found.'));
});

export default app;