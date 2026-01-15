import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
    caseId: Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        caseId: {
            type: Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by case
MessageSchema.index({ caseId: 1, createdAt: 1 });

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
