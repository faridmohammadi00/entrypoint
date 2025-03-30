import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/IUser';

const UserSchema: Schema = new Schema<IUser>({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    idNumber: {
        type: String,
        required: true,
        unique: true,
    },
    city: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    phoneConfirmed: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    role: {
        type: String,
        enum: ['user', 'doorman', 'admin'],
        required: true,
    },
    emailConfirmed: {
        type: Boolean,
        default: false,
    },
    confirmationCode: {
        type: String,
        default: null,
    },
    confirmationCodeExpires: {
        type: Date,
        default: null,
    },
    registrar: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
