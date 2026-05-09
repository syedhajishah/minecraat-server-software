import path from 'path';

const rootDir = path.resolve(process.cwd());

export function safeResolve(requestPath: string): string {
    const normalizedPath = requestPath || '.';
    const resolved = path.resolve(rootDir, normalizedPath);
    if (!resolved.startsWith(rootDir)) {
        throw new Error('Access outside workspace is not allowed');
    }
    return resolved;
}
