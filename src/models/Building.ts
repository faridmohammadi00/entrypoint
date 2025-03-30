import mongoose, { Schema, Document } from 'mongoose';
import { IBuilding } from '../interfaces/IBuilding';
import QRCode from 'qrcode';
import crypto from 'crypto';

const BuildingSchema: Schema = new Schema<IBuilding>({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['building', 'complex', 'tower'],
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
    qrCode: {
        uniqueIdentifier: {
            type: String,
            unique: true,
        },
        imageUrl: {
            type: String,
        }
    },
}, { timestamps: true });

// Move QR code generation to pre-validate middleware
BuildingSchema.pre('validate', async function(this: IBuilding, next) {
    try {
        if (!this.qrCode?.uniqueIdentifier) {
            const randomString = crypto.randomBytes(8).toString('hex');
            const uniqueIdentifier = `BLD_${randomString}`;
            
            const buildingData = {
                id: this._id,
                name: this.name,
                identifier: uniqueIdentifier
            };
            
            const qrCodeImage = await QRCode.toDataURL(JSON.stringify(buildingData), {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 300
            });

            this.qrCode = {
                uniqueIdentifier,
                imageUrl: qrCodeImage
            };
        }
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Add an index for the unique identifier
BuildingSchema.index({ 'qrCode.uniqueIdentifier': 1 }, { unique: true, sparse: true });

const Building = mongoose.model<IBuilding>('Building', BuildingSchema);
export default Building;
