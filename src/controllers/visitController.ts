import { Request, Response } from 'express';
import Visit from '../models/Visit';
import Visitor from '../models/Visitor';
import { handleErrorResponse } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Create a new visit record
export const createVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleErrorResponse(res, 400, messages['validation_failed']);
        return;
    }

    const { building_id, visitor_id, purpose, unit, check_in_date, check_out_date, status } = req.body;
    const user_id = req.user?._id;

    try {
        // Ensure visitor exists
        const visitor = await Visitor.findById(visitor_id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        const newVisit = new Visit({
            building_id,
            user_id,
            visitor_id,
            purpose,
            unit,
            check_in_date,
            check_out_date,
            status,
        });

        const savedVisit = await newVisit.save();
        res.status(201).json({
            message: messages['visit_created'],
            visit: savedVisit,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get all visits
export const getAllVisits = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        const visits = await Visit.find()
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');
        res.status(200).json(visits);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get a visit by ID
export const getVisitById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const visit = await Visit.findById(id)
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');

        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        res.status(200).json(visit);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update visit (Check-out time or status)
export const updateVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { check_out_date, status } = req.body;

    try {
        const visit = await Visit.findById(id);
        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        visit.check_out_date = check_out_date || visit.check_out_date;
        visit.status = status || visit.status;

        const updatedVisit = await visit.save();
        res.status(200).json({
            message: messages['visit_updated'],
            visit: updatedVisit,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
