import mongoose, { Document } from 'mongoose';

export interface IBuilding extends Document {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    type: 'building' | 'complex' | 'tower';
    userId: mongoose.Schema.Types.ObjectId;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
    qrCode?: {
        uniqueIdentifier: string;
        imageUrl: string;
    };
}
