import mongoose, { Schema } from 'mongoose';
import { IVisit } from '../interfaces/IVisit';

const VisitSchema: Schema = new Schema<IVisit>({
    building_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    visitor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        required: true,
    },
    purpose: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    check_in_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    check_out_date: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

// Ensure that the same visitor can only visit the same building once per session
VisitSchema.index({ building_id: 1, visitor_id: 1, check_in_date: 1 }, { unique: true });

const Visit = mongoose.model<IVisit>('Visit', VisitSchema);
export default Visit;
