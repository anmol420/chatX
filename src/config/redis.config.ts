import { Redis } from "ioredis";

import { env } from "../helpers/env.helper";

class RedisConnect {
    private redisClient: Redis | null = null;
    async connect(): Promise<void> {
        try {
            this.redisClient = new Redis(env.REDIS_URL, {
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });
            this.redisClient.on('connect', () => {
                console.log('Redis connected successfully');
            });
            this.redisClient.on('error', (error) => {
                console.error('Redis connection error:', error);
            });
            await this.redisClient.connect();
        } catch (error: any) {
            throw error;
        }
    }   
    private getClient(): Redis {
        if (!this.redisClient) {
            throw new Error("Redis client not initialized");
        }
        return this.redisClient;
    }
    async disconnect(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.redisClient = null;
            console.log('Redis client disconnected');
        }
    }
    async setBlackListToken(token: string, ttl: number): Promise<void> {
        const client = this.getClient();
        await client.setex(`blacklist_${token}`, ttl, 'true');
    }
    async getBlackListToken(token: string): Promise<boolean> {
        const client = this.getClient();
        const response = await client.get(`blacklist_${token}`);
        return response !== null;
    }
    async setData(prefix: string, token: string, ttl: number, data: any): Promise<void> {
        const client = this.getClient();
        await client.setex(`${prefix}_${token}`, ttl, JSON.stringify(data));
    }
    async getData(prefix: string, token: string): Promise<string | null> {
        const client = this.getClient();
        const response = await client.get(`${prefix}_${token}`);
        return response;
    }
}

export const redisConnect = new RedisConnect();