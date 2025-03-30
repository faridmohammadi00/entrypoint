import { Response } from 'express';

export const handleErrorResponse = (res: Response, statusCode: number, message: string, errors: any[] = []) => {
    res.status(statusCode).json({ message, errors });
};
