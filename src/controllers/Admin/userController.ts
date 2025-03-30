import { Request, Response } from 'express';
import User from '../../models/User';
import { handleErrorResponse } from '../../helpers/authHelpers';
import loadMessages from '../../helpers/messageHelper';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { hashPassword } from '../../helpers/authHelpers';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get all users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Get user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Update user
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;
    const { fullname, email, phone, role, status, idNumber, city, address } = req.body;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        // Check if idNumber is being updated and is not already in use
        if (idNumber && idNumber !== user.idNumber) {
            const existingUserWithId = await User.findOne({ idNumber });
            if (existingUserWithId) {
                handleErrorResponse(res, 400, messages['id_number_in_use']);
                return;
            }
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.role = role || user.role;
        user.status = status || user.status;
        user.idNumber = idNumber || user.idNumber;
        user.city = city || user.city;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.status(200).json({
            message: messages['user_updated'],
            user: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                idNumber: updatedUser.idNumber,
                city: updatedUser.city,
                address: updatedUser.address,
            },
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: messages['user_deleted'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Create user
export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const { fullname, email, password, phone, idNumber, role, status, city, address } = req.body;

        // Check for existing email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            handleErrorResponse(res, 400, messages['email_in_use']);
            return;
        }

        // Check for existing ID number
        const existingUserWithId = await User.findOne({ idNumber });
        if (existingUserWithId) {
            handleErrorResponse(res, 400, messages['id_number_in_use']);
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            phone,
            idNumber,
            city,
            address,
            role: role || 'user',
            status: status || 'active',
            emailConfirmed: true // Admin-created users don't need email confirmation
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: messages['user_created'],
            user: {
                fullname: savedUser.fullname,
                email: savedUser.email,
                phone: savedUser.phone,
                idNumber: savedUser.idNumber,
                city: savedUser.city,
                address: savedUser.address,
                role: savedUser.role,
                status: savedUser.status
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Activate user
export const activateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        user.status = 'active';
        const updatedUser = await user.save();

        res.status(200).json({
            message: messages['user_activated'],
            user: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                idNumber: updatedUser.idNumber,
            },
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Inactivate user
export const inactivateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { id } = req.params;

    try {
        if (req.user?.role !== 'admin') {
            handleErrorResponse(res, 403, messages['not_authorized']);
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        user.status = 'inactive';
        const updatedUser = await user.save();

        res.status(200).json({
            message: messages['user_inactivated'],
            user: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                idNumber: updatedUser.idNumber,
            },
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 