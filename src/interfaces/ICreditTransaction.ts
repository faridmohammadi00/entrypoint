import { Document, Types } from 'mongoose';

export interface ICreditTransaction extends Document {
    userId: Types.ObjectId;
    buildingId?: Types.ObjectId;
    purpose: string;
    type: 'building' | 'user';
    action: 'add' | 'delete';
    date: Date;
    deleted: boolean;
    deletedAt?: Date | null;

    softDelete(): Promise<void>;
    restore(): Promise<void>;
}
