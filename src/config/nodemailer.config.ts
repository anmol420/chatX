import { createTransport } from "nodemailer";

import { env } from "../helpers/env.helper";

export const transporter = createTransport({
    host: env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
    }
});