import { Request, Response } from 'express';
import Building from '../models/Building';
import { handleErrorResponse } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import ActivePlan from '../models/ActivePlan';
import Plan from '../models/Plan';
import CreditTransaction from '../models/CreditTransaction';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Create a new building
export const createBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleErrorResponse(res, 400, messages['validation_failed']);
        return;
    }

    const { name, address, city, latitude, longitude, type, status } = req.body;
    const userId = req.user?.id;

    try {
        const activePlan = await ActivePlan.findOne({
            userId,
            status: 'active'
        }).populate('planId');

        if (!activePlan) {
            handleErrorResponse(res, 403, messages['no_active_plan']);
            return;
        }

        const buildingTransactions = await CreditTransaction.countDocuments({
            userId,
            type: 'building',
            action: 'add',
            deleted: false
        });

        const userTransactions = await CreditTransaction.countDocuments({
            userId,
            type: 'user',
            action: 'add',
            deleted: false
        });

        const plan = activePlan.planId as any; // Type assertion for populated plan

        if (buildingTransactions >= plan.buildingCredit) {
            handleErrorResponse(res, 403, messages['building_credit_exceeded']);
            return;
        }

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

        const creditTransaction = new CreditTransaction({
            userId,
            buildingId: savedBuilding._id,
            purpose: 'Building creation',
            type: 'building',
            action: 'add'
        });

        await creditTransaction.save();

        res.status(201).json({
            message: messages['building_created'],
            building: savedBuilding,
            remainingBuildingCredits: plan.buildingCredit - (buildingTransactions + 1),
            remainingUserCredits: plan.userCredit - userTransactions
        });

    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get all buildings
export const getAllBuildings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const userId = req.user?.id;

    try {
        const buildings = await Building.find({ userId }).populate('userId', 'fullname email');
        res.status(200).json(buildings);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get a building by ID
export const getBuildingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { id } = req.params;

    try {
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

// Update a building (Only the owner can update)
export const updateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { id } = req.params;
    const { name, address, city, latitude, longitude, type, status } = req.body;
    const userId = req.user?.id;

    try {
        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        if (building.userId.toString() !== userId) {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        building.name = name || building.name;
        building.address = address || building.address;
        building.city = city || building.city;
        building.latitude = latitude || building.latitude;
        building.longitude = longitude || building.longitude;
        building.type = type || building.type;
        building.status = status || building.status;

        const updatedBuilding = await building.save();

        res.status(200).json({
            message: messages['building_updated'],
            building: updatedBuilding,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete a building (Only the owner can delete)
export const deleteBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        if (building.userId.toString() !== userId) {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        await Building.findByIdAndDelete(id);
        res.status(200).json({ message: messages['building_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate a building (Only the owner can activate)
export const activateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        if (building.userId.toString() !== userId) {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        if (building.status === 'active') {
            handleErrorResponse(res, 400, messages['building_already_active'] || 'Building is already active');
            return;
        }

        building.status = 'active';
        const updatedBuilding = await building.save();

        res.status(200).json({
            message: messages['building_activated'] || 'Building activated successfully',
            building: updatedBuilding,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Deactivate a building (Only the owner can deactivate)
export const deactivateBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const building = await Building.findById(id);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        if (building.userId.toString() !== userId) {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        if (building.status === 'inactive') {
            handleErrorResponse(res, 400, messages['building_already_inactive'] || 'Building is already inactive');
            return;
        }

        building.status = 'inactive';
        const updatedBuilding = await building.save();

        res.status(200).json({
            message: messages['building_inactivated'] || 'Building deactivated successfully',
            building: updatedBuilding,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
