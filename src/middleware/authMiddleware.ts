import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { handleErrorResponse } from '../helpers/errorHandler';
import User from '../models/User';
import { IUser } from '../interfaces/IUser';

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            return handleErrorResponse(res, 401, 'Unauthorized: No token provided');
        }

        // Add logging to debug token
        console.log('Verifying token:', token);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as {
            userId: string;
            email: string;
            role: string;
        };

        // Find the user using userId from token
        const user: IUser | null = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return handleErrorResponse(res, 401, 'Unauthorized: User not found');
        }

        // Add logging to debug found user
        console.log('Found user:', user.email);

        req.user = user;
        next();
    } catch (error) {
        return handleErrorResponse(res, 401, 'Unauthorized: Invalid token');
    }
};
