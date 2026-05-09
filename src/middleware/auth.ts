import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const ensureAuthenticated = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): void => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return next(createHttpError(401, 'Unauthorized'));
    }

    res.redirect('/login');
};

export const ensureRole = (role: 'admin' | 'moderator' | 'user') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw createHttpError(401, 'Unauthorized');
        }
        const roles = ['user', 'moderator', 'admin'];
        if (roles.indexOf(req.user.role) < roles.indexOf(role)) {
            throw createHttpError(403, 'Forbidden');
        }
        next();
    };
};
