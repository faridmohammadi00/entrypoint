import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Middleware to validate the request
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, return a 400 response with errors
        res.status(400).json({ errors: errors.array() });
        return;
    }
    // If validation is successful, pass control to the next middleware
    next();
};
