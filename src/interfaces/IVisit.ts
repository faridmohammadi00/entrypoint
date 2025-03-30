import mongoose, { Document } from 'mongoose';

export interface IVisit extends Document {
    building_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    visitor_id: mongoose.Types.ObjectId;
    purpose: string;
    unit: string;
    check_in_date: Date;
    check_out_date: Date;
    status: string; // e.g., 'pending', 'completed', 'cancelled'
}
