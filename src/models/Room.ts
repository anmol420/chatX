import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    admins: mongoose.Types.ObjectId[];
    members: mongoose.Types.ObjectId[];
    isPrivate: boolean;
    maxMembers?: number;
    roomType: 'public' | 'private' | 'direct';
    lastMessage?: mongoose.Types.ObjectId;
    lastActivity: Date;
}

const RoomSchema = new Schema<IRoom>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    description: {
        type: String,
        maxLength: 200,
        default: null,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    admins: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    maxMembers: {
        type: Number,
        default: 100,
    },
    roomType: {
        type: String,
        enum: ["public", "private", "direct"],
        default: "public",
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    lastActivity: {
        type: Date,
        default: Date.now(),
    },
}, {
    timestamps: true,
});

RoomSchema.pre("save", async function (next) {
    if (this.isNew && !this.admins.includes(this.owner)) {
        this.admins.push(this.owner);
    }
    next();
});

export const Room = mongoose.model<IRoom>("Room", RoomSchema);