import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import createHttpError from 'http-errors';
import { safeResolve } from '../utils/pathUtils';

const router = Router();
const upload = multer({ dest: path.join(process.cwd(), 'tmp'), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res, next) => {
    try {
        const target = safeResolve(req.query.path as string);
        const items = fs.readdirSync(target, { withFileTypes: true }).map((entry) => {
            const fullPath = path.join(target, entry.name);
            const stat = fs.statSync(fullPath);
            return {
                name: entry.name,
                isDirectory: entry.isDirectory(),
                size: stat.size,
                modified: stat.mtime,
            };
        });
        res.json({ path: path.relative(process.cwd(), target) || '.', items });
    } catch (error) {
        next(error);
    }
});

router.post('/read', (req, res, next) => {
    try {
        const file = safeResolve(req.body.path);
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            throw createHttpError(400, 'Invalid file');
        }
        res.json({ content: fs.readFileSync(file, 'utf8') });
    } catch (error) {
        next(error);
    }
});

router.post('/write', (req, res, next) => {
    try {
        const file = safeResolve(req.body.path);
        const content = req.body.content;
        if (typeof content !== 'string') {
            throw createHttpError(400, 'File content must be text');
        }
        fs.writeFileSync(file, content, 'utf8');
        res.json({ saved: true });
    } catch (error) {
        next(error);
    }
});

router.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        const dir = safeResolve(req.body.path || '.');
        if (!req.file) {
            throw createHttpError(400, 'No file uploaded');
        }
        const target = path.join(dir, req.file.originalname);
        const ext = path.extname(target).toLowerCase();
        const blocked = ['.exe', '.bat', '.sh', '.cmd', '.php', '.pl'];
        if (blocked.includes(ext)) {
            fs.unlinkSync(req.file.path);
            throw createHttpError(400, 'Upload of this file type is not permitted');
        }
        fs.renameSync(req.file.path, target);
        res.json({ uploaded: true, file: req.file.originalname });
    } catch (error) {
        next(error);
    }
});

export { router as filesRouter };
