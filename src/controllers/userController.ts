import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import EmailConfirmationToken from '../models/EmailConfirmationToken';
import { sendConfirmationEmail } from '../services/emailService';
import { handleErrorResponse, hashPassword, comparePassword, generateToken } from '../helpers/authHelpers';
import loadMessages from '../helpers/messageHelper';
import { IUser } from '../interfaces/IUser';

// Get language from request headers or default to English
const getLanguage = (req: Request) => req.headers['accept-language'] || 'en';

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleErrorResponse(res, 400, messages['validation_failed']);
        return;
    }

    const { fullname, email, password, phone, idNumber } = req.body;

    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            handleErrorResponse(res, 400, messages['email_in_use']);
            return;
        }

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
            role: 'user',
            emailConfirmed: false,
        });

        const savedUser = await newUser.save();

        // Create a confirmation token for the user
        const confirmationToken = new EmailConfirmationToken({
            userId: savedUser._id,
            token: Math.floor(100000 + Math.random() * 900000).toString(),
            expiresAt: new Date(Date.now() + 3600000),
        });

        const savedConfirmationToken = await confirmationToken.save();

        savedUser.confirmationCode = savedConfirmationToken.token;
        savedUser.confirmationCodeExpires = savedConfirmationToken.expiresAt;

        // Send confirmation email with the token
        // await sendConfirmationEmail(savedUser);

        res.status(201).json({
            message: messages['registration_success'],
            user: {
                fullname: savedUser.fullname,
                email: savedUser.email,
                phone: savedUser.phone,
                idNumber: savedUser.idNumber,
                role: savedUser.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Confirm the user's email using the confirmation token
export const confirmEmail = async (req: Request, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { token } = req.params;

    try {
        const confirmationToken = await EmailConfirmationToken.findOne({ token });

        if (!confirmationToken) {
            handleErrorResponse(res, 400, messages['invalid_confirmation_token']);
            return;
        }

        if (confirmationToken.expiresAt < new Date()) {
            handleErrorResponse(res, 400, messages['confirmation_token_expired']);
            return;
        }

        const user = await User.findById(confirmationToken.userId);
        if (!user) {
            handleErrorResponse(res, 400, messages['user_not_found']);
            return;
        }

        user.emailConfirmed = true;
        await user.save();

        await EmailConfirmationToken.deleteOne({ token });

        res.status(200).json({ message: messages['email_confirmed'] });
    } catch (error) {
        console.error(error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};

// Login a user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const lang = getLanguage(req);
    const messages = loadMessages(lang);

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            handleErrorResponse(res, 400, messages['invalid_credentials']);
            return;
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            handleErrorResponse(res, 400, messages['invalid_credentials']);
            return;
        }

        if (!user.emailConfirmed) {
            handleErrorResponse(res, 400, messages['email_not_confirmed']);
            return;
        }

        // Generate token with consistent payload structure
        const token = generateToken(user._id.toString(), user.email, user.role);

        // Add logging to debug token generation
        console.log('Generated token for user:', user.email);

        res.status(200).json({
            message: messages['login_success'],
            token,
            user: {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                idNumber: user.idNumber,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        handleErrorResponse(res, 500, messages['internal_server_error']);
    }
};
