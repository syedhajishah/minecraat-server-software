import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const passwordService = {
    hashPassword: async (password: string): Promise<string> => bcrypt.hash(password, 12),
    verifyPassword: async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash),
};

export const tokenService = {
    sign: (payload: Record<string, unknown>, expiresIn = '1h'): string =>
        jwt.sign(payload, config.sessionSecret, { expiresIn }),
    verify: <T>(token: string): T => jwt.verify(token, config.sessionSecret) as T,
};
