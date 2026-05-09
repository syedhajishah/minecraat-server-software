import compression from 'compression';
import cookieParser from 'cookie-parser';
import connectPgSimple from 'connect-pg-simple';
import csurf from 'csurf';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import session from 'express-session';
import { config } from './config';
import { authRouter } from './routes/auth';
import { serversRouter } from './routes/servers';
import { filesRouter } from './routes/files';
import { pluginsRouter } from './routes/plugins';
import { errorHandler } from './middleware/errorHandler';
import { ensureAuthenticated } from './middleware/auth';

const app = express();
const PgSession = connectPgSimple(session);

app.set('trust proxy', config.trustProxy);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(
    session({
        store: new PgSession({ conString: config.databaseUrl }),
        name: 'mcpanel.sid',
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        },
    }),
);

const apiLimiter = rateLimit({
    windowMs: config.apiRateLimitWindowMs,
    max: config.apiRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use(csurf({ cookie: config.csrfCookie }));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/auth', authRouter);
app.use('/api/servers', ensureAuthenticated, serversRouter);
app.use('/api/files', ensureAuthenticated, filesRouter);
app.use('/api/plugins', ensureAuthenticated, pluginsRouter);

app.use(errorHandler);

export { app };
