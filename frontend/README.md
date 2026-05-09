# Minecraft Panel - Frontend

A modern React + Vite + TypeScript frontend for the Minecraft hosting panel.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Architecture

- **Pages**: Full-page components for routing
- **Components**: Reusable UI components (buttons, cards, modals)
- **Layouts**: Page layout wrappers (sidebar, header)
- **Services**: API client and WebSocket services
- **Store**: Zustand state management
- **Styles**: Tailwind CSS utility styling

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- Recharts
- Tailwind CSS
- Lucide Icons
