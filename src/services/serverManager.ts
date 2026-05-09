import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { LogLevel, ServerInstance } from '@prisma/client';
import { prisma } from './prismaClient';

interface RunningServer {
    process: ChildProcessWithoutNullStreams;
    port: number;
    directory: string;
}

const activeServers = new Map<string, RunningServer>();
let io: SocketIOServer;

export const serverManager = {
    initialize(socketServer: SocketIOServer) {
        io = socketServer;
    },

    async startServer(instance: ServerInstance) {
        if (activeServers.has(instance.id)) {
            return { running: true };
        }

        const jarPath = path.join(instance.directory, 'purpur.jar');
        if (!fs.existsSync(jarPath)) {
            throw new Error('Server jar not found');
        }

        const child = spawn('java', ['-jar', jarPath, 'nogui'], {
            cwd: instance.directory,
            env: process.env,
        });

        activeServers.set(instance.id, {
            process: child,
            port: instance.port,
            directory: instance.directory,
        });

        child.stdout.on('data', async (data) => {
            const line = data.toString();
            await prisma.logEntry.create({
                data: {
                    serverId: instance.id,
                    level: line.includes('WARN') ? LogLevel.WARN : line.includes('ERROR') ? LogLevel.ERROR : LogLevel.INFO,
                    message: line,
                    source: 'minecraft',
                },
            });
            io.to(`server:${instance.id}`).emit('console', { text: line });
        });

        child.stderr.on('data', (data) => {
            const line = data.toString();
            io.to(`server:${instance.id}`).emit('console', { text: line, level: 'ERROR' });
        });

        child.on('close', async (code) => {
            activeServers.delete(instance.id);
            io.to(`server:${instance.id}`).emit('status', { running: false, exitCode: code });
            await prisma.serverInstance.update({
                where: { id: instance.id },
                data: { status: 'CRASHED' },
            });
        });

        await prisma.serverInstance.update({
            where: { id: instance.id },
            data: { status: 'RUNNING' },
        });

        return { running: true };
    },

    async stopServer(serverId: string) {
        const active = activeServers.get(serverId);
        if (!active) {
            return;
        }
        active.process.stdin.write('stop\n');
    },

    async fetchMetrics(serverId: string) {
        const logs = await prisma.logEntry.findMany({
            where: { serverId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return {
            logs,
            players: await prisma.playerState.findMany({ where: { serverId, online: true } }),
        };
    },

    cleanupClient(clientId: string) {
        // placeholder for subscriptions and socket cleanup
    },
};
