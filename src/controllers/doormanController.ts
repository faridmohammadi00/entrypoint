import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Building from '../models/Building';
import User from '../models/User';
import DoormanBuilding from '../models/DoormanBuilding';
import { handleErrorResponse } from '../helpers/authHelpers';
import loadMessages from '../helpers/messageHelper';
import ActivePlan from '../models/ActivePlan';
import CreditTransaction from '../models/CreditTransaction';

// Get the language from request headers
const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Assign a doorman to a building
export const assignDoorman = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId, userId } = req.body;

    try {
        // Check if the building exists
        const building = await Building.findById(buildingId);
        if (!building) {
            handleErrorResponse(res, 404, messages['building_not_found']);
            return;
        }

        // Ensure the user is a doorman
        const user = await User.findById(userId);
        if (!user || user.role !== 'doorman') {
            handleErrorResponse(res, 400, messages['invalid_doorman']);
            return;
        }

        // Check if the doorman is already assigned to the building
        const existingAssignment = await DoormanBuilding.findOne({ buildingId, userId });
        if (existingAssignment) {
            handleErrorResponse(res, 400, messages['doorman_already_assigned']);
            return;
        }

        // Create a new assignment
        const newAssignment = new DoormanBuilding({
            buildingId,
            userId,
            status: 'active',
        });

        const savedAssignment = await newAssignment.save();

        res.status(201).json({
            message: messages['doorman_assigned'],
            assignment: savedAssignment,
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Remove a doorman from a building
export const removeDoorman = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId, userId } = req.body;

    try {
        // Check if the doorman assignment exists
        const assignment = await DoormanBuilding.findOne({ buildingId, userId });
        if (!assignment) {
            handleErrorResponse(res, 404, messages['doorman_assignment_not_found']);
            return;
        }

        // Remove the assignment
        await DoormanBuilding.findByIdAndDelete(assignment._id);

        res.status(200).json({
            message: messages['doorman_removed'],
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get all doormen assigned to a building
export const getDoormenForBuilding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId } = req.params;

    try {
        // Get all doormen for the building
        const assignments = await DoormanBuilding.find({ buildingId }).populate('userId', 'fullname email');
        if (!assignments || assignments.length === 0) {
            handleErrorResponse(res, 404, messages['no_doormen_assigned']);
            return;
        }

        res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get a doorman assignment by building and user
export const getDoormanAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId, userId } = req.params;

    try {
        const assignment = await DoormanBuilding.findOne({ buildingId, userId }).populate('userId', 'fullname email');
        if (!assignment) {
            handleErrorResponse(res, 404, messages['doorman_assignment_not_found']);
            return;
        }

        res.status(200).json(assignment);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Register a new doorman
export const registerDoorman = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { fullname, email, password, phone, idNumber, city, address } = req.body;
    const registrarId = req.user?.id;

    try {
        // Check if user has an active plan
        const activePlan = await ActivePlan.findOne({
            userId: registrarId,
            status: 'active'
        }).populate('planId');

        if (!activePlan) {
            handleErrorResponse(res, 403, messages['no_active_plan']);
            return;
        }

        // Check user credit limit
        const userTransactions = await CreditTransaction.countDocuments({
            userId: registrarId,
            type: 'user',
            action: 'add',
            deleted: false
        });

        const plan = activePlan.planId as any; // Type assertion for populated plan

        if (userTransactions >= plan.userCredit) {
            handleErrorResponse(res, 403, messages['user_credit_exceeded']);
            return;
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            handleErrorResponse(res, 400, messages['email_in_use']);
            return;
        }

        // Check if phone already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            handleErrorResponse(res, 400, messages['phone_in_use']);
            return;
        }

        // Check if ID number already exists
        const existingIdNumber = await User.findOne({ idNumber });
        if (existingIdNumber) {
            handleErrorResponse(res, 400, messages['id_number_in_use']);
            return;
        }

        const newDoorman = new User({
            fullname,
            email,
            password,
            phone,
            idNumber,
            city,
            address,
            role: 'doorman',
            status: 'active',
            registrar: registrarId
        });

        const savedDoorman = await newDoorman.save();

        // Create credit transaction record
        const creditTransaction = new CreditTransaction({
            userId: registrarId,
            purpose: 'Doorman creation',
            type: 'user',
            action: 'add'
        });

        await creditTransaction.save();

        res.status(201).json({
            message: messages['doorman_created'],
            doorman: {
                _id: savedDoorman._id,
                fullname: savedDoorman.fullname,
                email: savedDoorman.email,
                phone: savedDoorman.phone,
                idNumber: savedDoorman.idNumber,
                city: savedDoorman.city,
                address: savedDoorman.address,
                role: savedDoorman.role,
                status: savedDoorman.status
            },
            remainingUserCredits: plan.userCredit - (userTransactions + 1)
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Edit a doorman
export const editDoorman = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { id } = req.params;
    const { fullname, email, phone, city, address, status } = req.body;

    try {
        const doorman = await User.findOne({ _id: id, role: 'doorman' });
        if (!doorman) {
            handleErrorResponse(res, 404, messages['doorman_not_found']);
            return;
        }

        // Check if new email is already in use
        if (email && email !== doorman.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                handleErrorResponse(res, 400, messages['email_in_use']);
                return;
            }
        }

        // Check if new phone is already in use
        if (phone && phone !== doorman.phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                handleErrorResponse(res, 400, messages['phone_in_use']);
                return;
            }
        }

        doorman.fullname = fullname || doorman.fullname;
        doorman.email = email || doorman.email;
        doorman.phone = phone || doorman.phone;
        doorman.city = city || doorman.city;
        doorman.address = address || doorman.address;
        doorman.status = status || doorman.status;

        const updatedDoorman = await doorman.save();

        res.status(200).json({
            message: messages['doorman_updated'],
            doorman: {
                _id: updatedDoorman._id,
                fullname: updatedDoorman.fullname,
                email: updatedDoorman.email,
                phone: updatedDoorman.phone,
                idNumber: updatedDoorman.idNumber,
                city: updatedDoorman.city,
                address: updatedDoorman.address,
                role: updatedDoorman.role,
                status: updatedDoorman.status
            }
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// List all doormen
export const listDoormen = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        // Get all doormen with basic info
        const doormen = await User.find({ role: 'doorman' })
            .select('-password -confirmationCode -confirmationCodeExpires')
            .populate('registrar', 'fullname email');

        // Get building assignments for all doormen
        const doormenWithBuildings = await Promise.all(
            doormen.map(async (doorman) => {
                const assignments = await DoormanBuilding.find({ 
                    userId: doorman._id,
                    status: 'active'
                }).populate('buildingId');

                return {
                    ...doorman.toObject(),
                    buildings: assignments.map(assignment => assignment.buildingId)
                };
            })
        );

        res.status(200).json(doormenWithBuildings);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get doorman by ID
export const getDoormanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        const doorman = await User.findOne({ _id: id, role: 'doorman' })
            .select('-password -confirmationCode -confirmationCodeExpires')
            .populate('registrar', 'fullname email');

        if (!doorman) {
            handleErrorResponse(res, 404, messages['doorman_not_found']);
            return;
        }

        res.status(200).json(doorman);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate doorman building assignment
export const activateAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId, userId } = req.body;

    try {
        // Check if there's any active assignment for this doorman in this building
        const existingActiveAssignment = await DoormanBuilding.findOne({
            buildingId,
            userId,
            status: 'active'
        });

        if (existingActiveAssignment) {
            handleErrorResponse(res, 400, messages['doorman_already_active']);
            return;
        }

        // Find the inactive assignment
        const assignment = await DoormanBuilding.findOne({
            buildingId,
            userId,
            status: 'inactive'
        });

        if (!assignment) {
            handleErrorResponse(res, 404, messages['doorman_assignment_not_found']);
            return;
        }

        // Update the status to active
        assignment.status = 'active';
        const updatedAssignment = await assignment.save();

        res.status(200).json({
            message: messages['assignment_activated'],
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Deactivate doorman building assignment
export const deactivateAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { buildingId, userId } = req.body;

    try {
        // Find the active assignment
        const assignment = await DoormanBuilding.findOne({
            buildingId,
            userId,
            status: 'active'
        });

        if (!assignment) {
            handleErrorResponse(res, 404, messages['active_assignment_not_found']);
            return;
        }

        // Update the status to inactive
        assignment.status = 'inactive';
        const updatedAssignment = await assignment.save();

        res.status(200).json({
            message: messages['assignment_deactivated'],
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
