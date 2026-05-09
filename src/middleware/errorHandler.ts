import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

export function errorHandler(err: Error | HttpError, req: Request, res: Response, next: NextFunction): void {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err.message || 'Internal Server Error';
    console.error(err);
    if (req.headers.accept?.includes('application/json') || req.path.startsWith('/api')) {
        res.status(status).json({ error: message });
        return;
    }
    res.status(status).send(message);
}
