import { Request, Response } from 'express';
import Visitor from '../models/Visitor';
import { handleErrorResponse } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Helper function to check user role
const checkUserRole = (req: AuthenticatedRequest, res: Response, messages: any): boolean => {
    const allowedRoles = ['admin', 'doorman'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        handleErrorResponse(res, 403, messages['unauthorized_access']);
        return false;
    }
    return true;
};

// Create a new visitor
export const createVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    // Check user role
    if (!checkUserRole(req, res, messages)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleErrorResponse(res, 400, messages['validation_failed']);
        return;
    }

    const { fullname, id_number, birthday, gender, region, expire_date, phone, status } = req.body;

    try {
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
            status,
        });

        const savedVisitor = await newVisitor.save();
        res.status(201).json({
            message: messages['visitor_created'],
            visitor: savedVisitor,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get all visitors
export const getAllVisitors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    // Check user role
    if (!checkUserRole(req, res, messages)) return;

    try {
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

    // Check user role
    if (!checkUserRole(req, res, messages)) return;

    const { id } = req.params;

    try {
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

// Update visitor information
export const updateVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    // Check user role
    if (!checkUserRole(req, res, messages)) return;

    const { id } = req.params;
    const { fullname, birthday, gender, region, expire_date, phone, status } = req.body;

    try {
        const visitor = await Visitor.findById(id);
        if (!visitor) {
            handleErrorResponse(res, 404, messages['visitor_not_found']);
            return;
        }

        visitor.fullname = fullname || visitor.fullname;
        visitor.birthday = birthday || visitor.birthday;
        visitor.gender = gender || visitor.gender;
        visitor.region = region || visitor.region;
        visitor.expire_date = expire_date || visitor.expire_date;
        visitor.phone = phone || visitor.phone;
        visitor.status = status || visitor.status;

        const updatedVisitor = await visitor.save();
        res.status(200).json({
            message: messages['visitor_updated'],
            visitor: updatedVisitor,
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

    // Check user role
    if (!checkUserRole(req, res, messages)) return;

    const { id } = req.params;

    try {
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
