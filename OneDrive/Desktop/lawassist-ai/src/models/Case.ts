import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICase extends Document {
    title: string;
    userId: Types.ObjectId;
    status: "active" | "completed";
    solution?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
    {
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },
        solution: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by user
CaseSchema.index({ userId: 1, createdAt: -1 });

const Case: Model<ICase> =
    mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);

export default Case;
