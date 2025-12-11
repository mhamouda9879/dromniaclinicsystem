# Files to Deploy to Server

## Backend Files (Required)

Deploy these files/folders to your server:

```
backend/
├── dist/                    # Built application (after npm run build)
├── node_modules/            # Production dependencies only
├── package.json
├── package-lock.json
├── .env                     # Production environment variables
└── src/                     # Source files (optional, only if you need migrations)
    └── config/
        └── typeorm.config.ts  # For running migrations
```

## Frontend Files (Required)

Deploy the built frontend:

```
frontend/
└── build/                   # Built React app (after npm run build)
    ├── index.html
    ├── static/
    │   ├── css/
    │   ├── js/
    │   └── media/
    └── ... (all built files)
```

## What NOT to Deploy

- `.env.example` files
- `node_modules` (reinstall on server with `npm install --production`)
- `.git/` folder
- `src/` folder (only deploy `dist/` for backend)
- Development dependencies
- Test files
- `*.log` files
- IDE configuration files

## Build Commands

### Backend Build

```bash
cd backend
npm install --production
npm run build
```

This creates the `dist/` folder with compiled JavaScript.

### Frontend Build

```bash
cd frontend
npm install
npm run build
```

This creates the `build/` folder with production-ready React app.

## Deployment Scripts

See deployment scripts in this directory for automated deployment.

