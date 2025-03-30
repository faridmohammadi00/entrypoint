import { Request, Response } from 'express';
import Building from '../../models/Building';
import { handleErrorResponse } from '../../helpers/authHelpers';
import loadMessages from '../../helpers/messageHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { validationResult } from 'express-validator';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all buildings
export const getAllBuildings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const buildings = await Building.find().populate('userId', 'fullname email');
        res.status(200).json(buildings);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get building by ID
export const getBuildingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const building = await Building.findById(id).populate('userId', 'fullname email');
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        res.status(200).json(building);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Create building
export const createBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const { name, address, city, latitude, longitude, type, userId, status } = req.body;

        const newBuilding = new Building({
            name,
            address,
            city,
            latitude,
            longitude,
            type,
            userId,
            status: status || 'active'
        });

        const savedBuilding = await newBuilding.save();

        res.status(201).json({
            message: messages['building_created'],
            building: savedBuilding
        });
    } catch (error) {
        console.error('Create building error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update building
export const updateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { name, address, city, latitude, longitude, type, userId, status } = req.body;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        building.name = name || building.name;
        building.address = address || building.address;
        building.city = city || building.city;
        building.latitude = latitude ?? building.latitude;  // Using ?? because latitude could be 0
        building.longitude = longitude ?? building.longitude;  // Using ?? because longitude could be 0
        building.type = type || building.type;
        building.userId = userId || building.userId;
        building.status = status || building.status;

        const updatedBuilding = await building.save();
        res.status(200).json({
            message: messages['building_updated'],
            building: updatedBuilding
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete building
export const deleteBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        await Building.findByIdAndDelete(id);
        res.status(200).json({ message: messages['building_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate building
export const activateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        building.status = 'active';
        const updatedBuilding = await building.save();

        res.status(200).json({
            message: messages['building_activated'],
            building: updatedBuilding
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Inactivate building
export const inactivateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        building.status = 'inactive';
        const updatedBuilding = await building.save();

        res.status(200).json({
            message: messages['building_inactivated'],
            building: updatedBuilding
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 