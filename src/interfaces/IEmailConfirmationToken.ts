import mongoose, { Document } from 'mongoose';

// Define the schema for the Email Confirmation Token
export interface IEmailConfirmationToken extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}