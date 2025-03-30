import { Request, Response } from 'express';
import Plan from '../../models/Plan';
import { handleErrorResponse } from '../../helpers/authHelpers';
import loadMessages from '../../helpers/messageHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { validationResult } from 'express-validator';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all plans
export const getAllPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plans = await Plan.find();
        res.status(200).json(plans);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get plan by ID
export const getPlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plan = await Plan.findById(id);
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

// Create plan
export const createPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const { planName, buildingCredit, userCredit, price, status, monthlyVisits } = req.body;

        const newPlan = new Plan({
            planName,
            buildingCredit,
            userCredit,
            monthlyVisits,
            price,
            status: status || 'active'
        });

        const savedPlan = await newPlan.save();
        res.status(201).json({
            message: messages['plan_created'],
            plan: savedPlan
        });
    } catch (error) {
        console.error('Create plan error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update plan
export const updatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { planName, buildingCredit, userCredit, price, status, monthlyVisits } = req.body;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plan = await Plan.findById(id);
        if (!plan) {
            handleErrorResponse(res, 404, messages['plan_not_found']);
            return;
        }

        plan.planName = planName || plan.planName;
        plan.buildingCredit = buildingCredit ?? plan.buildingCredit;
        plan.userCredit = userCredit ?? plan.userCredit;
        plan.monthlyVisits = monthlyVisits ?? plan.monthlyVisits;
        plan.price = price ?? plan.price;
        plan.status = status || plan.status;

        const updatedPlan = await plan.save();
        res.status(200).json({
            message: messages['plan_updated'],
            plan: updatedPlan
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete plan
export const deletePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plan = await Plan.findById(id);
        if (!plan) {
            handleErrorResponse(res, 404, messages['plan_not_found']);
            return;
        }

        await Plan.findByIdAndDelete(id);
        res.status(200).json({ message: messages['plan_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate plan
export const activatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plan = await Plan.findById(id);
        if (!plan) {
            handleErrorResponse(res, 404, messages['plan_not_found']);
            return;
        }

        plan.status = 'active';
        const updatedPlan = await plan.save();

        res.status(200).json({
            message: messages['plan_activated'],
            plan: updatedPlan
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Inactivate plan
export const inactivatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const plan = await Plan.findById(id);
        if (!plan) {
            handleErrorResponse(res, 404, messages['plan_not_found']);
            return;
        }

        plan.status = 'inactive';
        const updatedPlan = await plan.save();

        res.status(200).json({
            message: messages['plan_inactivated'],
            plan: updatedPlan
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 