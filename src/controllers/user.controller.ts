import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../helpers/jwt.helper";
import { AuthRequest } from "../middleware/auth.middleware";
import { errorResponse, successResponse } from "../utils/response";

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json(errorResponse(400, 'Please provide username, email, and password'));
        return;
    }
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existingUser) {
        res.status(400).json(errorResponse(400, 'User with this email or username already exists'));
        return;
    }
    try {
        const user = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password
        });
        await user.save();
        res.status(201).json(successResponse(201, 'User created', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json(errorResponse(400, 'Please provide email and password'));
        return;
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        res.status(404).json(errorResponse(400, 'User not found'));
        return;
    }
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
        res.status(401).json(errorResponse(400, 'Invalid credentials'));
        return;
    }
    try {
        await User.findByIdAndUpdate(user._id, {
            isOnline: true,
            lastSeen: new Date(),
        });
        const token = generateToken(user._id as string);
        res.status(200).json(successResponse(200, 'Login successful', {
            id: user._id,
            username: user.username,
            email: user.email,
            isOnline: true,
            token: token,
        }));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                isOnline: false,
                lastSeen: new Date(),
            });
        }
        res.status(200).json(successResponse(200, 'Logout successful', {}));
    } catch (error) {
        res.status(500).json(errorResponse(500, 'Internal server error'));
    }
};