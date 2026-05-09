# Minecraft Server Panel

A production-ready Minecraft hosting panel for managing multiple Purpur/Paper servers with modern deployment, database support, and a professional UI.

## What’s Included

- **Multi-server architecture** with independent instances, ports, backups, and logs
- **Prisma + PostgreSQL** for users, permissions, server configs, backups, and activity history
- **JWT/session auth** with role-based access (admin/mod/user)
- **Secure backend** using Helmet, CSRF, rate limiting, compression, and secure cookies
- **Modern frontend** with Monaco editor lazy loading, virtualized file rendering, and socket reconnects
- **Production deployment** support with Docker, Docker Compose, PM2, and Nginx reverse proxy scaffolding
- **File manager** with upload validation, dangerous extension blocking, and plugin metadata scanning
- **Monitoring** with CPU/RAM analytics, player states, TPS placeholders, and crash detection

## Quick Start

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript backend:
   ```bash
   npm run build
   ```
4. Start in production mode:
   ```bash
   npm start
   ```

## Development

- Start locally with hot reload:
  ```bash
  npm run dev
  ```
- Lint code:
  ```bash
  npm run lint
  ```
- Format project:
  ```bash
  npm run format
  ```

## Docker Deployment

- Build and run with Docker Compose:
  ```bash
  docker compose up --build
  ```

## PM2 Deployment

- Start with PM2:
  ```bash
  npm run pm2:start
  ```
- Stop the app:
  ```bash
  npm run pm2:stop
  ```

## Database

- Prisma is configured for PostgreSQL in `prisma/schema.prisma`
- Use `DATABASE_URL` in `.env` to point at your database
- The schema includes tables for users, servers, backups, plugins, logs, API tokens, and activity history

## Production Notes

- Set `NODE_ENV=production` and `SSL_ENABLED=true` when using TLS
- Use a strong `SESSION_SECRET`
- Mount persistent storage for `plugins`, `backups`, and logs
- Configure Nginx or another reverse proxy for HTTPS termination

- Login system for local panel access
- Send commands to the Minecraft server

## Setup

1. Place your `purpur.jar` in the workspace root: `c:\Users\admin\Desktop\server software\purpur.jar`
2. Install dependencies:

```bash
npm install
```

3. Start the web panel:

```bash
npm start
```

4. Open the panel in your browser:

```text
http://localhost:3000
```

5. Open the login page if required:

```text
http://localhost:3000/login
```

6. Use the default login in `auth.json` or update it before starting the panel.

## Next Phases

- Phase 2: login system, plugin installer, world settings editor
- Phase 3: deploy online and control remotely via a VPS

## Notes

- The panel currently starts the Minecraft server with `java -jar purpur.jar nogui`
- Make sure Java is installed and available in your PATH
- The `public` folder contains the web UI assets
