import { redisConnect } from "../config/redis.config";

export const getSearchByUsername = async (username: string): Promise<any> => {
    try {
        const res = await redisConnect.getData('search', username);
        if (!res) {
            return null;
        }
        const data = JSON.parse(res);
        return data;
    } catch (error) {
        throw error;
    }
};

export const setSearchByUsername = async (username: string, data: any): Promise<void> => {
    try {
        await redisConnect.setData('search', username, 300, data);
    } catch (error) {
        throw error;
    }
};