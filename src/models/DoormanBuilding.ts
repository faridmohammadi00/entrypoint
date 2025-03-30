import mongoose, { Schema, Document } from 'mongoose';
import { IDoormanBuilding } from '../interfaces/IDoormanBuilding';

const DoormanBuildingSchema: Schema = new Schema<IDoormanBuilding>({
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a doorman can only be assigned to the same building once
DoormanBuildingSchema.index({ buildingId: 1, userId: 1 }, { unique: true });

const DoormanBuilding = mongoose.model<IDoormanBuilding>('DoormanBuilding', DoormanBuildingSchema);
export default DoormanBuilding;
