import { Request, Response } from 'express';
import ActivePlan from '../models/ActivePlan';
import Plan from '../models/Plan';
import { handleErrorResponse } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Activate a new plan for a user
export const createActivePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: messages['validation_failed'],
        });
        return;
    }

    const userId = req.user?._id;
    const { planId } = req.body;

    try {
        const newActivePlan = new ActivePlan({
            userId,
            planId,
            status: 'pending',
        });

        const savedActivePlan = await newActivePlan.save();

        res.status(201).json({
            message: messages['active_plan_created'],
            activePlan: savedActivePlan,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: messages['internal_server_error'] });
    }
};

// Get all active plans for a user
export const getUserActivePlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const userId = req.user?._id;

    try {
        const activePlans = await ActivePlan.find({ userId }).populate('planId');
        res.status(200).json(activePlans);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get an active plan by ID
export const getActivePlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { id } = req.params;

    try {
        const activePlan = await ActivePlan.findById(id).populate('planId');
        if (!activePlan) {
            handleErrorResponse(res, 404, messages['active_plan_not_found']);
            return;
        }
        res.status(200).json(activePlan);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Cancel an active plan
export const cancelActivePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const activePlan = await ActivePlan.findById(id);
        if (!activePlan) {
            handleErrorResponse(res, 404, messages['active_plan_not_found']);
            return;
        }

        // Ensure only the owner can cancel
        if (activePlan.userId.toString() !== userId) {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        activePlan.status = 'cancelled';
        await activePlan.save();

        res.status(200).json({
            message: messages['plan_cancelled'],
            activePlan,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

