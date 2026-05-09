import { Router } from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../services/prismaClient';
import { passwordService, tokenService } from '../services/authService';
import { config } from '../config';

const router = Router();

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw createHttpError(400, 'Email and password are required');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw createHttpError(401, 'Invalid credentials');
        }

        const valid = await passwordService.verifyPassword(password, user.passwordHash);
        if (!valid) {
            throw createHttpError(401, 'Invalid credentials');
        }

        req.session.user = {
            id: user.id,
            role: user.role,
            email: user.email,
        };
        const token = tokenService.sign({ id: user.id, role: user.role });
        res.json({ authenticated: true, token, user: { email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ loggedOut: true });
    });
});

router.get('/status', (req, res) => {
    res.json({ authenticated: !!req.session.user, user: req.session.user || null });
});

router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw createHttpError(400, 'Email and password are required');
        }

        const passwordHash = await passwordService.hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'USER',
            },
        });

        res.status(201).json({ created: true, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

router.post('/seed-admin', async (req, res, next) => {
    try {
        const existing = await prisma.user.findUnique({ where: { email: config.adminEmail } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    email: config.adminEmail,
                    passwordHash: config.adminPasswordHash,
                    role: 'ADMIN',
                },
            });
        }
        res.json({ seeded: true });
    } catch (error) {
        next(error);
    }
});

export { router as authRouter };
