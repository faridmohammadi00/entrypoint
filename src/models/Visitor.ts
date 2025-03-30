import mongoose, { Schema } from 'mongoose';
import { IVisitor } from '../interfaces/IVisitor';

const VisitorSchema: Schema = new Schema<IVisitor>({
    fullname: {
        type: String,
        required: true,
    },
    id_number: {
        type: String,
        required: true,
        unique: true,
    },
    birthday: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    expire_date: {
        type: Date,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });

const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);
export default Visitor;
