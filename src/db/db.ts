import { connect } from "mongoose";

import { env } from "../helpers/env.helper";

const dbConnect = async (): Promise<void> => {
    try {
        const conn = await connect(`${env.MONGO_URI}/chat_app`);
        console.log(`MongoDB connected at: ${conn.connection.host}`);
    } catch (error) {
        throw new Error(`Failed to connect to DB: ${error}`);
    }
};

export default dbConnect;