import { Document, Types } from 'mongoose';

export interface IActivePlan extends Document {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    status: 'pending' | 'active' | 'expired' | 'cancelled';
    date?: Date;
}
