import { Request, Response } from 'express';
import Plan from '../models/Plan';
import { handleErrorResponse } from '../helpers/authHelpers';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all active plans
export const getActivePlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        const plans = await Plan.find({ status: 'active' })
            .select('planName buildingCredit userCredit price')
            .sort({ price: 1 }); // Sort by price ascending

        res.status(200).json(plans);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get active plan by ID
export const getActivePlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const plan = await Plan.findOne({ _id: id, status: 'active' })
            .select('planName buildingCredit userCredit price');

        if (!plan) {
            handleErrorResponse(res, 404, messages['plan_not_found']);
            return;
        }

        res.status(200).json(plan);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
