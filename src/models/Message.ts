import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    content: string;
    messageType: 'text' | 'image' | 'file';
    room?: string;
    recipient?: mongoose.Types.ObjectId;
    isEdited: boolean;
    editedAt?: Date;
    reactions: {
        emoji: string;
        users: mongoose.Types.ObjectId[];
    }[];
    replyTo?: mongoose.Types.ObjectId;
    isDeleted: boolean;
    readBy: {
        user: mongoose.Types.ObjectId;
        readAt: Date;
    }[];
}

const MessageSchema = new Schema<IMessage>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        minLength: 1,
        maxlength: 1000,
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    room: {
        type: String,
        default: null,
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
        default: null,
    },
    reactions: [{
        emoji: {
            type: String,
            required: true,
        },
        users: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
    }],
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    readBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        readAt: {
            type: Date,
            default: Date.now(),
        },
    }],
}, {
    timestamps: true,
});

MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);