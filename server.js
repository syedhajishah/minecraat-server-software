const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { spawn } = require('child_process');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rootDir = path.resolve(__dirname);
const serverJar = path.join(rootDir, 'purpur.jar');
let mcProcess = null;
let running = false;

app.use(express.json());
app.use(express.static(path.join(rootDir, 'public')));

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
        res.json({ path: path.relative(rootDir, dir), items });
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

io.on('connection', (socket) => {
    socket.emit('status', { running });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Web panel running on http://localhost:${PORT}`);
});
