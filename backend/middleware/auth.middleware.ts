import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiToken = req.headers['x-api-token'];

    // Allow options requests for CORS preflight
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (!process.env.API_SECRET_TOKEN) {
        console.error('API_SECRET_TOKEN is not defined in environment variables');
        return res.status(500).json({ error: 'Internal Server Configuration Error' });
    }

    if (!apiToken || apiToken !== process.env.API_SECRET_TOKEN) {
        return res.status(403).json({ error: 'Unauthorized: Invalid or missing token' });
    }

    next();
};
