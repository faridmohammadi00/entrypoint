import { Request, Response } from 'express';
import CreditTransaction from '../models/CreditTransaction';
import { handleErrorResponse } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Create a new credit transaction
export const createCreditTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleErrorResponse(res, 400, messages['validation_failed']);
        return;
    }

    const { buildingId, purpose, type, action } = req.body;
    const userId = req.user?.id;

    try {
        const newTransaction = new CreditTransaction({
            userId,
            buildingId: buildingId || null,
            purpose,
            type,
            action,
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json({
            message: messages['credit_transaction_created'],
            transaction: savedTransaction,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get all credit transactions (excluding soft-deleted)
export const getAllCreditTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        const transactions = await CreditTransaction.find({ deleted: false })
            .populate('userId', 'fullname email')
            .populate('buildingId', 'name address')
            .sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get a single credit transaction by ID
export const getCreditTransactionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const transaction = await CreditTransaction.findOne({ _id: id, deleted: false })
            .populate('userId', 'fullname email')
            .populate('buildingId', 'name address');

        if (!transaction) {
            handleErrorResponse(res, 404, messages['credit_transaction_not_found']);
            return;
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Soft delete a credit transaction
export const softDeleteCreditTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const transaction = await CreditTransaction.findById(id);

        if (!transaction || transaction.deleted) {
            handleErrorResponse(res, 404, messages['credit_transaction_not_found']);
            return;
        }

        await transaction.softDelete();

        res.status(200).json({ message: messages['credit_transaction_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Restore a soft-deleted credit transaction
export const restoreCreditTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const transaction = await CreditTransaction.findById(id);

        if (!transaction || !transaction.deleted) {
            handleErrorResponse(res, 404, messages['credit_transaction_not_found']);
            return;
        }

        await transaction.restore();

        res.status(200).json({ message: messages['credit_transaction_restored'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
