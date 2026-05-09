# Minecraft Server Panel

Local web panel for controlling a Purpur/Paper Minecraft server.

## Features

- Start and stop the server from a browser
- Real-time console output via Socket.io
- Basic file manager listing server directory contents
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

## Next Phases

- Phase 2: login system, plugin installer, world settings editor
- Phase 3: deploy online and control remotely via a VPS

## Notes

- The panel currently starts the Minecraft server with `java -jar purpur.jar nogui`
- Make sure Java is installed and available in your PATH
- The `public` folder contains the web UI assets
