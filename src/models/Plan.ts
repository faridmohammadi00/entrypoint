import mongoose, { Schema, Document } from 'mongoose';
import { IPlan } from '../interfaces/IPlan';

const PlanSchema: Schema = new Schema<IPlan>({
    planName: {
        type: String,
        required: true,
    },
    buildingCredit: {
        type: Number,
        required: true,
    },
    userCredit: {
        type: Number,
        required: true,
    },
    monthlyVisits: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
export default Plan;
