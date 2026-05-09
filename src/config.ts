import dotenv from 'dotenv';

dotenv.config();

const toBoolean = (value: string | undefined, fallback = false): boolean => {
    if (typeof value === 'undefined') {
        return fallback;
    }
    return ['true', '1', 'yes'].includes(value.toLowerCase());
};

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    sessionSecret: process.env.SESSION_SECRET || 'change-in-production',
    trustProxy: toBoolean(process.env.TRUST_PROXY, false),
    databaseUrl:
        process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mcpanel?schema=public',
    sslEnabled: toBoolean(process.env.SSL_ENABLED, false),
    sslCertPath: process.env.SSL_CERT_PATH || '',
    sslKeyPath: process.env.SSL_KEY_PATH || '',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPasswordHash:
        process.env.ADMIN_PASSWORD_HASH || '$2b$10$replace.with.your.hash',
    csrfCookie: toBoolean(process.env.CSRF_COOKIE, true),
    apiRateLimitWindowMs: 15 * 60 * 1000,
    apiRateLimitMax: 100,
};
