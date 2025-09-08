# Konnektaro Monorepo

This is a monorepo structure for Konnektaro with separate admin and user applications, plus shared components.

## Project Structure

```
konnektaro/
├── apps/
│   ├── admin/                 # Admin application (port 3001)
│   │   ├── src/
│   │   │   ├── app/          # Next.js app directory
│   │   │   ├── components/   # Admin-specific components
│   │   │   ├── hooks/        # Admin-specific hooks
│   │   │   ├── services/     # Admin-specific services
│   │   │   ├── lib/          # Admin-specific utilities
│   │   │   ├── types/        # Admin-specific types
│   │   │   ├── utils/        # Admin-specific utils
│   │   │   └── styles/       # Admin-specific styles
│   │   ├── public/           # Admin static assets
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── postcss.config.mjs
│   └── user/                 # User application (port 3000)
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # User-specific components
│       │   ├── hooks/        # User-specific hooks
│       │   ├── services/     # User-specific services
│       │   ├── lib/          # User-specific utilities
│       │   ├── types/        # User-specific types
│       │   ├── utils/        # User-specific utils
│       │   └── styles/       # User-specific styles
│       ├── public/           # User static assets
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       └── postcss.config.mjs
├── packages/
│   └── shared/              # Shared components and utilities
│       ├── src/
│       │   ├── components/   # Shared UI components
│       │   ├── hooks/        # Shared custom hooks
│       │   ├── services/     # Shared API services
│       │   ├── lib/          # Shared utilities
│       │   ├── types/        # Shared TypeScript types
│       │   ├── utils/        # Shared utility functions
│       │   └── contexts/     # Shared React contexts
│       ├── package.json
│       └── tsconfig.json
├── package.json              # Root package.json with workspaces
└── README.md
```

## Environment Variables (.env files)

### Admin App Environment Variables
Place your admin-specific environment variables in:
```
apps/admin/.env.local
apps/admin/.env.production
```

### User App Environment Variables
Place your user-specific environment variables in:
```
apps/user/.env.local
apps/user/.env.production
```

### Shared Environment Variables
If you have environment variables that both apps need, you can:
1. Duplicate them in both app's .env files
2. Create a shared config in `packages/shared/src/lib/config.ts`
3. Use the root `.env` file for truly global variables

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development
Run both apps simultaneously:
```bash
npm run dev:all
```

Or run them individually:
```bash
# Admin app (port 3001)
npm run dev:admin

# User app (port 3000)
npm run dev:user
```

### 3. Building
Build all apps:
```bash
npm run build:all
```

Or build individually:
```bash
npm run build:admin
npm run build:user
```

### 4. Linting
Lint all apps:
```bash
npm run lint:all
```

Or lint individually:
```bash
npm run lint:admin
npm run lint:user
```

## Using Shared Components

Both apps can import shared components using the configured aliases:

```typescript
// Import shared components
import { Button } from '@shared/components';
import { useAuth } from '@shared/hooks';
import { apiService } from '@shared/services';
import { User } from '@shared/types';

// Or use the full path
import { Button } from '@shared/components/Button';
```

## Available Aliases

Both apps have the following aliases configured:

- `@shared` → `../../packages/shared/src`
- `@shared/components` → `../../packages/shared/src/components`
- `@shared/hooks` → `../../packages/shared/src/hooks`
- `@shared/services` → `../../packages/shared/src/services`
- `@shared/lib` → `../../packages/shared/src/lib`
- `@shared/types` → `../../packages/shared/src/types`
- `@shared/utils` → `../../packages/shared/src/utils`
- `@shared/contexts` → `../../packages/shared/src/contexts`

## Ports

- **User App**: http://localhost:3000
- **Admin App**: http://localhost:3001

