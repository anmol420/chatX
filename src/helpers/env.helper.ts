export type ExpiryString = `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;

interface EnvConfig {
    PORT: number;
    JWT_SECRET: string;
    JWT_EXPIRY: ExpiryString | number;
    MONGO_URI: string;
    CORS_ORIGIN: string;
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
}