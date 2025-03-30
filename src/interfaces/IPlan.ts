import { Document, Types } from 'mongoose';

export interface IPlan extends Document {
    _id: Types.ObjectId;
    planName: string;
    buildingCredit: number;
    userCredit: number;
    monthlyVisits: number;
    price: number;
    status: 'active' | 'inactive';
    date?: Date;
}
