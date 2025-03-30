import mongoose, { Document } from 'mongoose';

export interface IPhoneOTP extends Document {
    userId: mongoose.Types.ObjectId;
    phone: string;
    otpCode: string;
    expiresAt: Date;
}
