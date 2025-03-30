import mongoose, { Schema, Document } from 'mongoose';
import { IEmailConfirmationToken } from '../interfaces/IEmailConfirmationToken';

const EmailConfirmationTokenSchema: Schema = new Schema<IEmailConfirmationToken>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 3600000),
        index: { expires: '1h' },
    },
}, { timestamps: true });

// Create and export the model for EmailConfirmationToken
const EmailConfirmationToken = mongoose.model<IEmailConfirmationToken>('EmailConfirmationToken', EmailConfirmationTokenSchema);

export default EmailConfirmationToken;
