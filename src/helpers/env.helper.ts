export type ExpiryString = `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;

interface EnvConfig {
    PORT: number;
    JWT_SECRET: string;
    JWT_EXPIRY: ExpiryString | number;
    MONGO_URI: string;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    SMTP_HOST: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    RABBITMQ_USER: string;
    RABBITMQ_PASSWORD: string;
}

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

const getNumberEnv = (key: string): number => {
    const value = Number(getEnv(key));
    if (isNaN(value)) {
        throw new Error(`Invalid number value for ${key}`);
    }
    return value;
}

const isValidExpiry = (val: string): val is ExpiryString => /^\d+(ms|s|m|h|d|w|y)$/.test(val);

export const env: EnvConfig = {
    PORT: getNumberEnv("PORT"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_EXPIRY: (() => {
        let value: string | number = getEnv("JWT_EXPIRY");
        if (isValidExpiry(value)) return value;
        value = getNumberEnv("JWT_EXPIRY");
        if (!isNaN(value)) return value;
        throw new Error(`Invalid JWT_EXPIRY format`);
    })(),
    MONGO_URI: getEnv("MONGO_URI"),
    CORS_ORIGIN: getEnv("CORS_ORIGIN"),
    DATABASE_URL: getEnv("DATABASE_URL"),
    REDIS_URL: getEnv("REDIS_URL"),
    SMTP_HOST: getEnv("SMTP_HOST"),
    SMTP_USER: getEnv("SMTP_USER"),
    SMTP_PASSWORD: getEnv("SMTP_PASSWORD"),
    RABBITMQ_USER: getEnv("RABBITMQ_USER"),
    RABBITMQ_PASSWORD: getEnv("RABBITMQ_PASSWORD"),
}