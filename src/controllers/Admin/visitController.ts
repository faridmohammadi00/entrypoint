import { Request, Response } from 'express';
import Visit from '../../models/Visit';
import Visitor from '../../models/Visitor';
import { handleErrorResponse } from '../../helpers/authHelpers';
import loadMessages from '../../helpers/messageHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { validationResult } from 'express-validator';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all visits
export const getAllVisits = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

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

// Get visit by ID
export const getVisitById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

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

// Create visit
export const createVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const { building_id, user_id, visitor_id, purpose, unit, check_in_date, check_out_date, status } = req.body;

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
            check_in_date: check_in_date || new Date(),
            check_out_date,
            status: status || 'pending'
        });

        const savedVisit = await newVisit.save();
        
        const populatedVisit = await Visit.findById(savedVisit._id)
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');

        res.status(201).json({
            message: messages['visit_created'],
            visit: populatedVisit
        });
    } catch (error) {
        console.error('Create visit error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update visit
export const updateVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { building_id, user_id, visitor_id, purpose, unit, check_in_date, check_out_date, status } = req.body;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visit = await Visit.findById(id);
        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        visit.building_id = building_id || visit.building_id;
        visit.user_id = user_id || visit.user_id;
        visit.visitor_id = visitor_id || visit.visitor_id;
        visit.purpose = purpose || visit.purpose;
        visit.unit = unit || visit.unit;
        visit.check_in_date = check_in_date || visit.check_in_date;
        visit.check_out_date = check_out_date || visit.check_out_date;
        visit.status = status || visit.status;

        const updatedVisit = await visit.save();
        
        const populatedVisit = await Visit.findById(updatedVisit._id)
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');

        res.status(200).json({
            message: messages['visit_updated'],
            visit: populatedVisit
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete visit
export const deleteVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visit = await Visit.findById(id);
        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        await Visit.findByIdAndDelete(id);
        res.status(200).json({ message: messages['visit_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Complete visit
export const completeVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visit = await Visit.findById(id);
        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        visit.status = 'completed';
        visit.check_out_date = new Date();
        
        const updatedVisit = await visit.save();
        const populatedVisit = await Visit.findById(updatedVisit._id)
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');

        res.status(200).json({
            message: messages['visit_completed'],
            visit: populatedVisit
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Cancel visit
export const cancelVisit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visit = await Visit.findById(id);
        if (!visit) {
            handleErrorResponse(res, 404, messages['visit_not_found']);
            return;
        }

        visit.status = 'cancelled';
        const updatedVisit = await visit.save();
        
        const populatedVisit = await Visit.findById(updatedVisit._id)
            .populate('building_id', 'name address')
            .populate('user_id', 'fullname email')
            .populate('visitor_id', 'fullname id_number');

        res.status(200).json({
            message: messages['visit_cancelled'],
            visit: populatedVisit
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 