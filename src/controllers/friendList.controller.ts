import { Response } from "express";
import { eq, sql } from "drizzle-orm";

import { db, users } from "../db";
import { AuthRequest } from "../middleware/auth.middleware";
import { errorResponse, successResponse } from "../utils/response";

export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string)
    });
    if (!user) {
        res.status(404).json(errorResponse(404, 'User not found'));
        return;
    }
    try {
        res.status(200).json(successResponse(200, 'Friend list fetched successfully', {
            friends: user.friendList,
        }));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const getFriendReqSent = async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string)
    });
    if (!user) {
        res.status(404).json(errorResponse(404, 'User not found'));
        return;
    }
    try {
        res.status(200).json(successResponse(200, 'Friend list fetched successfully', {
            friendReqSent: user.friendRequestSend,
        }));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const getFriendReqReceived = async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string)
    });
    if (!user) {
        res.status(404).json(errorResponse(404, 'User not found'));
        return;
    }
    try {
        res.status(200).json(successResponse(200, 'Friend list fetched successfully', {
            friendReqReceived: user.friendRequestRecieved,
        }));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const sendFriendReq = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    const sender = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string),
    });
    if (!sender) {
        res.status(401).json(errorResponse(401, 'Authentication middleware error'));
        return;
    }
    if (sender.friendRequestSend.includes(username.toLowerCase().trim()) || sender.friendList.includes(username.toLowerCase().trim()) || sender.friendRequestRecieved.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User already in friend list or req has been sent or recieved earlier'));
        return;
    }
    const toSendUser = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!toSendUser) {
        res.status(404).json(errorResponse(404, `User not found with username: ${username}`));
        return;
    }
    try {
        await db.update(users)
            .set({
                friendRequestSend: sql`array_append(${users.friendRequestSend}, ${toSendUser.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, sender.id));
        await db.update(users)
            .set({
                friendRequestRecieved: sql`array_append(${users.friendRequestRecieved}, ${sender.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, toSendUser.id));
        res.status(200).json(successResponse(200, 'Friend request sent', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const acceptFriendReq = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    const receiver = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string),
    });
    if (!receiver) {
        res.status(401).json(errorResponse(401, 'Authentication middleware error'));
        return;
    }
    if (!receiver.friendRequestRecieved.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User not in your friend req recieved list'));
        return;
    }
    if (receiver.friendList.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User already in your friend list'));
        return;
    }
    const acceptedUser = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!acceptedUser) {
        res.status(404).json(errorResponse(404, `User not found with username: ${username}`));
        return;
    }
    try {
        await db.update(users)
            .set({
                friendList: sql`array_append(${users.friendList}, ${acceptedUser.username})`,
                friendRequestRecieved: sql`array_remove(${users.friendRequestRecieved}, ${acceptedUser.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, receiver.id));
        await db.update(users)
            .set({
                friendList: sql`array_append(${users.friendList}, ${receiver.username})`,
                friendRequestSend: sql`array_remove(${users.friendRequestSend}, ${receiver.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, acceptedUser.id));
        res.status(200).json(successResponse(200, 'Friend request accepted', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const rejectFriendReq = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    const receiver = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string),
    });
    if (!receiver) {
        res.status(401).json(errorResponse(401, 'Authentication middleware error'));
        return;
    }
    if (!receiver.friendRequestRecieved.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User not in your friend req recieved list'));
        return;
    }
    if (receiver.friendList.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User already in your friend list'));
        return;
    }
    const rejectedUser = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!rejectedUser) {
        res.status(404).json(errorResponse(404, `User not found with username: ${username}`));
        return;
    }
    try {
        await db.update(users)
            .set({
                friendRequestRecieved: sql`array_remove(${users.friendRequestRecieved}, ${rejectedUser.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, receiver.id));
        await db.update(users)
            .set({
                friendRequestSend: sql`array_remove(${users.friendRequestSend}, ${receiver.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, rejectedUser.id));
        res.status(200).json(successResponse(200, 'Friend request rejected', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const cancelFriendReq = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    const sender = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string),
    });
    if (!sender) {
        res.status(401).json(errorResponse(401, 'Authentication middleware error'));
        return;
    }
    if (!sender.friendRequestSend.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User not in your friend req sent list'));
        return;
    }
    if (sender.friendList.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User already in your friend list'));
        return;
    }
    const toSendUser = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!toSendUser) {
        res.status(404).json(errorResponse(404, `User not found with username: ${username}`));
        return;
    }
    try {
        await db.update(users)
            .set({
                friendRequestSend: sql`array_remove(${users.friendRequestSend}, ${toSendUser.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, sender.id));
        await db.update(users)
            .set({
                friendRequestRecieved: sql`array_remove(${users.friendRequestRecieved}, ${sender.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, toSendUser.id));
        res.status(200).json(successResponse(200, 'Friend request cancelled', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const removeFriend = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username } = req.body;
    if (!username) {
        res.status(400).json(errorResponse(400, 'Please provide a username'));
        return;
    }
    if (username === req.user?.username) {
        res.status(400).json(errorResponse(400, 'Don\'t search your username'));
        return;
    }
    const user = await db.query.users.findFirst({
        where: eq(users.id, req.user?.id as string),
    });
    if (!user) {
        res.status(401).json(errorResponse(401, 'Authentication middleware error'));
        return;
    }
    if (!user.friendList.includes(username.toLowerCase().trim())) {
        res.status(400).json(errorResponse(400, 'User is not in your friend list'));
        return;
    }
    const removedUser = await db.query.users.findFirst({
        where: eq(users.username, username.toLowerCase().trim()),
    });
    if (!removedUser) {
        res.status(404).json(errorResponse(404, `User not found with username: ${username}`));
        return;
    }
    try {
        await db.update(users)
            .set({
                friendList: sql`array_remove(${users.friendList}, ${removedUser.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, user.id));
        await db.update(users)
            .set({
                friendList: sql`array_remove(${users.friendList}, ${user.username})`,
                updatedAt: sql`NOW()`,
            }).where(eq(users.id, removedUser.id));
        res.status(200).json(successResponse(200, 'Friend removed', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};