import mongoose, { Document } from 'mongoose';

export interface IDoormanBuilding extends Document {
    buildingId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
    assignedAt: Date;
}
