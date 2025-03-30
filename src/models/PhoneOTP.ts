import mongoose, { Schema, Document } from 'mongoose';
import { IPhoneOTP } from '../interfaces/IPhoneOTP';


const PhoneOTPSchema: Schema = new Schema<IPhoneOTP>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    otpCode: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
    },
});

// Automatically delete expired OTPs after some time
PhoneOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PhoneOTP = mongoose.model<IPhoneOTP>('PhoneOTP', PhoneOTPSchema);
export default PhoneOTP;
