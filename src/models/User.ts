import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isOnline: boolean;
    lastSeen: Date;
    joinedRooms: string[];
    comparePassword: (password: string) => Promise<Boolean>;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    joinedRooms: [{
        type: String,
        default: [],
    }],
    lastSeen: {
        type: Date,
        default: Date.now(),
    }
}, {
    timestamps: true,
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error)
    }
});

UserSchema.method("comparePassword", async function (password: string) {
    return await bcrypt.compare(password, this.password);
});

export const User = mongoose.model<IUser>("User", UserSchema);
