import { Request, Response } from 'express';
import User from '../models/User';
import { handleErrorResponse } from '../helpers/authHelpers';
import loadMessages from '../helpers/messageHelper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { hashPassword, comparePassword } from '../helpers/authHelpers';
import { validationResult } from 'express-validator';

const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    try {
        const user = await User.findById(req.user?.id).select('-password');
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

// Update profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { fullname, email, phone, city, address } = req.body;

    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        // Check if email is being changed and is not already in use
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                handleErrorResponse(res, 400, messages['email_in_use']);
                return;
            }
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.city = city || user.city;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.status(200).json({
            message: messages['profile_updated'],
            user: {
                fullname: updatedUser.fullname,
                email: updatedUser.email,
                phone: updatedUser.phone,
                city: updatedUser.city,
                address: updatedUser.address,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            handleErrorResponse(res, 404, messages['user_not_found']);
            return;
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            handleErrorResponse(res, 400, messages['invalid_current_password']);
            return;
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            handleErrorResponse(res, 400, messages['passwords_do_not_match']);
            return;
        }

        // Hash and update password
        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({
            message: messages['password_changed']
        });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
}; 