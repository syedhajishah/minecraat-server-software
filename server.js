const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const session = require('express-session');
const multer = require('multer');
const { spawn } = require('child_process');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rootDir = path.resolve(__dirname);
const serverJar = path.join(rootDir, 'purpur.jar');
const pluginDir = path.join(rootDir, 'plugins');
const uploadTemp = path.join(rootDir, 'tmp');
const authConfigPath = path.join(rootDir, 'auth.json');

if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
}

if (!fs.existsSync(uploadTemp)) {
    fs.mkdirSync(uploadTemp, { recursive: true });
}

const authConfig = fs.existsSync(authConfigPath)
    ? JSON.parse(fs.readFileSync(authConfigPath, 'utf8'))
    : { username: 'admin', password: 'admin123' };

let mcProcess = null;
let running = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    name: 'panel.sid',
    secret: process.env.SESSION_SECRET || 'minecraft-panel-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const upload = multer({ dest: uploadTemp });

function authMiddleware(req, res, next) {
    if (req.path.startsWith('/auth')) {
        return next();
    }
    if (req.session && req.session.user) {
        return next();
    }

    if (req.path.startsWith('/api')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.redirect('/login');
}

function safeResolve(requestPath) {
    const resolved = path.resolve(rootDir, requestPath || '');
    if (!resolved.startsWith(rootDir)) {
        throw new Error('Access outside workspace is not allowed');
    }
    return resolved;
}

function startServer() {
    if (running) return;
    if (!fs.existsSync(serverJar)) {
        throw new Error('purpur.jar not found in workspace root. Place Purpur server jar here.');
    }

    mcProcess = spawn('java', ['-jar', serverJar, 'nogui'], {
        cwd: rootDir,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    mcProcess.stdout.on('data', (chunk) => {
        io.emit('console', chunk.toString());
    });

    mcProcess.stderr.on('data', (chunk) => {
        io.emit('console', chunk.toString());
    });

    mcProcess.on('close', (code) => {
        running = false;
        mcProcess = null;
        io.emit('status', { running: false, exitCode: code });
    });

    running = true;
    io.emit('status', { running });
}

function stopServer() {
    if (running && mcProcess) {
        mcProcess.stdin.write('stop\n');
    }
}

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === authConfig.username && password === authConfig.password) {
        req.session.user = username;
        return res.json({ authenticated: true });
    }
    res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ loggedOut: true });
    });
});

app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: !!req.session.user, user: req.session.user || null });
});

app.use('/api', authMiddleware);

app.get('/', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(rootDir, 'public', 'login.html'));
});

app.use(express.static(path.join(rootDir, 'public')));

app.get('/api/status', (req, res) => {
    res.json({ running });
});

app.post('/api/server/start', (req, res) => {
    try {
        startServer();
        res.json({ running });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/server/stop', (req, res) => {
    try {
        stopServer();
        res.json({ running });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/server/command', (req, res) => {
    const { command } = req.body;
    if (!running || !mcProcess) {
        return res.status(400).json({ error: 'Server is not running' });
    }
    mcProcess.stdin.write(`${command}\n`);
    res.json({ sent: true });
});

app.get('/api/files', (req, res) => {
    try {
        const dir = safeResolve(req.query.path || '.');
        const items = fs.readdirSync(dir, { withFileTypes: true }).map((entry) => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile()
        }));
        res.json({ path: path.relative(rootDir, dir) || '.', items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/files/read', (req, res) => {
    try {
        const file = safeResolve(req.body.path);
        res.json({ content: fs.readFileSync(file, 'utf8') });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/files/write', (req, res) => {
    try {
        const file = safeResolve(req.body.path);
        fs.writeFileSync(file, req.body.content, 'utf8');
        res.json({ saved: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/files/delete', (req, res) => {
    try {
        const file = safeResolve(req.body.path);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            fs.rmdirSync(file, { recursive: true });
        } else {
            fs.unlinkSync(file);
        }
        res.json({ deleted: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/plugins', (req, res) => {
    try {
        const plugins = fs.readdirSync(pluginDir, { withFileTypes: true })
            .filter((entry) => entry.isFile() && entry.name.endsWith('.jar'))
            .map((entry) => ({ name: entry.name }));
        res.json({ plugins });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/plugins/upload', upload.single('plugin'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No plugin file uploaded' });
        }
        const targetPath = path.join(pluginDir, req.file.originalname);
        fs.renameSync(req.file.path, targetPath);
        res.json({ installed: true, plugin: req.file.originalname });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/plugins/delete', (req, res) => {
    try {
        const pluginFile = safeResolve(path.join('plugins', req.body.name));
        if (!pluginFile.startsWith(pluginDir)) {
            throw new Error('Invalid plugin path');
        }
        fs.unlinkSync(pluginFile);
        res.json({ deleted: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

io.on('connection', (socket) => {
    socket.emit('status', { running });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Web panel running on http://localhost:${PORT}`);
});
