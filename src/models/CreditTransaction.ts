import mongoose, { Schema, Model, Query } from 'mongoose';
import { ICreditTransaction } from '../interfaces/ICreditTransaction';


const CreditTransactionSchema: Schema<ICreditTransaction> = new Schema<ICreditTransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    buildingId: {
        type: Schema.Types.ObjectId,
        ref: 'Building',
        default: null,
    },
    purpose: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['building', 'user'],
        required: true,
    },
    action: {
        type: String,
        enum: ['add', 'delete'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    }
});

// Middleware: Automatically filter out soft-deleted records
CreditTransactionSchema.pre<Query<any, ICreditTransaction>>(/^find/, function (next) {
    this.where({ deleted: false });
    next();
});

// Instance Methods for Soft Delete and Restore
CreditTransactionSchema.methods.softDelete = async function (): Promise<void> {
    this.deleted = true;
    this.deletedAt = new Date();
    await this.save();
};

CreditTransactionSchema.methods.restore = async function (): Promise<void> {
    this.deleted = false;
    this.deletedAt = null;
    await this.save();
};

// Define the Model
const CreditTransaction: Model<ICreditTransaction> = mongoose.model<ICreditTransaction>(
    'CreditTransaction',
    CreditTransactionSchema
);

export default CreditTransaction;
