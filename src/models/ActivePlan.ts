import mongoose, { Schema, Document } from 'mongoose';
import { IActivePlan } from '../interfaces/IActivePlan';

const ActivePlanSchema: Schema = new Schema<IActivePlan>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'cancelled'],
        default: 'pending',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const ActivePlan = mongoose.model<IActivePlan>('ActivePlan', ActivePlanSchema);
export default ActivePlan;
