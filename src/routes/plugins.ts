import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import createHttpError from 'http-errors';
import { prisma } from '../services/prismaClient';

const router = Router();

const pluginDirectory = path.join(process.cwd(), 'plugins');

function readPluginMetadata(filePath: string) {
    const zip = new AdmZip(filePath);
    const entry = zip.getEntry('plugin.yml');
    if (!entry) return null;
    try {
        const content = entry.getData().toString('utf8');
        const matchName = content.match(/name:\s*(.+)/i);
        const matchVersion = content.match(/version:\s*(.+)/i);
        return {
            name: matchName?.[1]?.trim() || path.basename(filePath),
            version: matchVersion?.[1]?.trim() || 'unknown',
        };
    } catch {
        return null;
    }
}

router.get('/', (req, res, next) => {
    try {
        const plugins = fs.readdirSync(pluginDirectory)
            .filter((name) => name.endsWith('.jar'))
            .map((name) => ({
                name,
                metadata: readPluginMetadata(path.join(pluginDirectory, name)),
            }));
        res.json({ plugins });
    } catch (error) {
        next(error);
    }
});

router.post('/upload', (req, res) => {
    res.status(501).json({ error: 'Plugin upload endpoint is managed by file upload route' });
});

router.post('/scan', async (req, res, next) => {
    try {
        const files = fs.readdirSync(pluginDirectory).filter((name) => name.endsWith('.jar'));
        const details = files.map((filename) => {
            const metadata = readPluginMetadata(path.join(pluginDirectory, filename));
            return { filename, metadata };
        });
        res.json({ plugins: details });
    } catch (error) {
        next(error);
    }
});

export { router as pluginsRouter };
