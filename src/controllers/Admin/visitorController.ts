import { Request, Response } from 'express';
import Visitor from '../../models/Visitor';
import { handleErrorResponse } from '../../helpers/authHelpers';
import loadMessages from '../../helpers/messageHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { validationResult } from 'express-validator';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all visitors
export const getAllVisitors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitors = await Visitor.find();
        res.status(200).json(visitors);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get visitor by ID
export const getVisitorById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        res.status(200).json(visitor);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Create visitor
export const createVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const { fullname, id_number, birthday, gender, region, expire_date, phone, status } = req.body;

        const existingVisitor = await Visitor.findOne({ id_number });
        if (existingVisitor) {
            handleErrorResponse(res, 400, messages['visitor_exists']);
            return;
        }

        const newVisitor = new Visitor({
            fullname,
            id_number,
            birthday,
            gender,
            region,
            expire_date,
            phone,
            status: status || 'active'
        });

        const savedVisitor = await newVisitor.save();
        res.status(201).json({
            message: messages['visitor_created'],
            visitor: savedVisitor
        });
    } catch (error) {
        console.error('Create visitor error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update visitor
export const updateVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { fullname, id_number, birthday, gender, region, expire_date, phone, status } = req.body;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        // Check if new ID number is already in use by another visitor
        if (id_number && id_number !== visitor.id_number) {
            const existingVisitor = await Visitor.findOne({ id_number });
            if (existingVisitor) {
                handleErrorResponse(res, 400, messages['visitor_exists']);
                return;
            }
        }

        visitor.fullname = fullname || visitor.fullname;
        visitor.id_number = id_number || visitor.id_number;
        visitor.birthday = birthday || visitor.birthday;
        visitor.gender = gender || visitor.gender;
        visitor.region = region || visitor.region;
        visitor.expire_date = expire_date || visitor.expire_date;
        visitor.phone = phone || visitor.phone;
        visitor.status = status || visitor.status;

        const updatedVisitor = await visitor.save();
        res.status(200).json({
            message: messages['visitor_updated'],
            visitor: updatedVisitor
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete visitor
export const deleteVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        await Visitor.findByIdAndDelete(id);
        res.status(200).json({ message: messages['visitor_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate visitor
export const activateVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        visitor.status = 'active';
        const updatedVisitor = await visitor.save();

        res.status(200).json({
            message: messages['visitor_activated'],
            visitor: updatedVisitor
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Inactivate visitor
export const inactivateVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        visitor.status = 'inactive';
        const updatedVisitor = await visitor.save();

        res.status(200).json({
            message: messages['visitor_inactivated'],
            visitor: updatedVisitor
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 