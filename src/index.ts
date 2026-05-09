import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { config } from './config';
import { serverManager } from './services/serverManager';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
});

io.on('connection', (socket) => {
    const clientId = socket.id;
    socket.emit('status', { connected: true });
    socket.on('subscribe', (payload) => {
        if (payload?.serverId) {
            socket.join(`server:${payload.serverId}`);
        }
    });
    socket.on('disconnect', () => {
        serverManager.cleanupClient(clientId);
    });
});

serverManager.initialize(io);

server.listen(config.port, () => {
    console.log(`Minecraft hosting panel running in ${config.env} on port ${config.port}`);
});
