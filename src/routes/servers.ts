import { Router } from 'express';
import createHttpError from 'http-errors';
import { prisma } from '../services/prismaClient';
import { serverManager } from '../services/serverManager';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const instances = await prisma.serverInstance.findMany({
            include: { plugins: true, backups: true, playerStates: true },
        });
        res.json({ servers: instances });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, slug, port, directory, template } = req.body;
        if (!name || !slug || !port || !directory) {
            throw createHttpError(400, 'Missing required server configuration');
        }

        const server = await prisma.serverInstance.create({
            data: {
                name,
                slug,
                port,
                directory,
                template,
                ownerId: req.session.user.id,
            },
        });
        res.status(201).json({ server });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/start', async (req, res, next) => {
    try {
        const instance = await prisma.serverInstance.findUnique({ where: { id: req.params.id } });
        if (!instance) {
            throw createHttpError(404, 'Server not found');
        }
        const status = await serverManager.startServer(instance);
        res.json({ status });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/stop', async (req, res, next) => {
    try {
        const instance = await prisma.serverInstance.findUnique({ where: { id: req.params.id } });
        if (!instance) {
            throw createHttpError(404, 'Server not found');
        }
        await serverManager.stopServer(instance.id);
        res.json({ stopped: true });
    } catch (error) {
        next(error);
    }
});

router.get('/:id/monitor', async (req, res, next) => {
    try {
        const metrics = await serverManager.fetchMetrics(req.params.id);
        res.json({ metrics });
    } catch (error) {
        next(error);
    }
});

export { router as serversRouter };
