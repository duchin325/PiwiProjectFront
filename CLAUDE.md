# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Piwi Encomiendas MVP** is a Next.js 15 shipment management system for logistics operations. It manages shipments, clients, drivers, and trips with a mock API backend for MVP phase. The app is in Spanish and targets logistics operators.

## Core Architecture

### Frontend Stack
- **Next.js 15.5.2** with App Router (not Pages Router)
- **React 19.1.0** with latest patterns
- **TypeScript 5** for type safety
- **Tailwind CSS 4** with PostCSS integration
- **Axios** for HTTP requests with interceptors
- **Sonner** for toast notifications

### Key Architectural Patterns

#### 1. Authentication System
- **Location**: `src/app/context/AuthProvider.tsx` + `src/hooks/useAuth.ts`
- Token stored in localStorage and synced to httpOnly cookie via `/api/auth/login`
- Middleware protects routes in `src/middleware.ts`
- Login/register use mock API initially, ready for real backend integration
- Public routes: `/auth/login`, `/auth/register`
- Protected routes: `/dashboard`, `/shipments`, `/clients`, `/drivers`, `/trips`
- On successful auth, user redirects to `/dashboard`; logged-in users on auth pages redirect to `/dashboard`

#### 2. Route Structure
```
src/app/
├── (main)/                 # Protected routes layout (sidebar + topbar)
│   ├── dashboard/
│   ├── shipments/[id]/     # Dynamic detail pages
│   ├── clients/[id]/
│   ├── drivers/
│   └── trips/[id]/
├── auth/                   # Public auth pages
│   ├── login/
│   └── register/
└── api/
    └── auth/
        ├── login/          # Sets httpOnly cookie
        └── logout/         # Clears cookie
```
Page routes use optional catch-all: `[id]` folder for detail views with dynamic routing.

#### 3. Data Layer & Mock/Real API Switching
- **Data adapters**: `src/app/lib/data/[entity].ts` (clients.ts, shipments.ts, drivers.ts, trips.ts)
- **Mock API**: `src/app/lib/mockApi.ts` - Complete in-memory implementation with artificial delays
- **Switching via env**: `NEXT_PUBLIC_USE_MOCK`, `NEXT_PUBLIC_USE_MOCK_CLIENTS`, `NEXT_PUBLIC_USE_MOCK_SHIPMENTS`, etc.
- **Fallback pattern**: Real API calls with automatic fallback to mock on error (see `logMockFallback()`)
- **Backend normalization**: Data adapters normalize between frontend types and backend DTOs (e.g., `ShipmentStatus` maps to `BackendOrderStatus`)
- **API base URL**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`)

#### 4. State Management & Hooks
- **No Redux/Context state beyond auth** - uses local React hooks with useState
- **Custom hooks** in `src/hooks/`: `useAuth.ts`, `useClients.ts`, `useShipments.ts`, `useDrivers.ts`, `useTrips.ts`
- **Hook pattern**: Each returns `{ data, loading, error, refresh, create, update, remove, ...}` 
- **Notification integration**: Hooks use `notify.promise()` to show loading/success/error toasts
- **Client-side only**: All hooks marked `'use client'`

#### 5. Component Structure
- **Layout components**: `src/components/layout/` (Sidebar, Topbar)
- **Form components**: `src/components/[entity]/` (ClientForm, ShipmentForm, DriverForm, TripForm)
- **UI components**: `src/components/ui/` (Table, Modal, StatusBadge, Skeleton, StatsCards, EmptyState, ToasterClient)
- **Dev utilities**: `src/components/dev/ExposeToast.tsx` (development-only toast debugger)

#### 6. Type System
- Central types in `src/app/lib/types.ts`: `User`, `Shipment`, `Client`, `Driver`, `Trip`, `RouteStop`
- Enums: `Role` ('admin' | 'operator'), `ShipmentStatus` ('pending' | 'active' | 'completed'), `tripStatus`, `RouteStopType`
- All IDs are strings in frontend (normalized from backend numbers)

#### 7. Styling & CSS
- Tailwind CSS 4 with custom utility classes defined in `src/app/globals.css`
- Custom classes: `.card`, `.btn`, `.btn-primary`, `.input`, `.label`, `.container-page`
- Print styles included for A4 report generation
- Light color scheme by default

### Data Flow Example (Create Shipment)
1. User submits ShipmentForm in modal
2. `ShipmentsPage` calls `useShipments().create(input)`
3. Hook calls `shipmentsData.createShipment(input)` 
4. Data adapter checks `USE_MOCK_SHIPMENTS` env var
5. If true: calls `mockApi.createShipment()` directly
6. If false: calls `api.post('/orders', payload)` with normalization; falls back to mock on error
7. Hook emits `notify.promise()` toast showing loading/success/error
8. Hook updates local state and returns created record
9. Modal closes, page refreshes

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run development server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
```

## Configuration & Environment

### TypeScript Config
- `baseUrl: "src"` - allows imports like `@/app/lib` instead of `../../../`
- Path aliases: `@/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/context/*`
- Strict mode enabled

### Environment Variables
Create `.env.local` for local overrides:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_USE_MOCK_CLIENTS=true
NEXT_PUBLIC_USE_MOCK_SHIPMENTS=true
NEXT_PUBLIC_USE_MOCK_DRIVERS=true
NEXT_PUBLIC_USE_MOCK_TRIPS=true
```

### Next.js Middleware
Configured in `src/middleware.ts` with matcher `/((?!api|_next/static|_next/image|favicon.ico).*)`. Validates token in cookies and redirects based on route protection rules.

## Common Development Tasks

### Adding a New Entity/Resource
1. Add type definition to `src/app/lib/types.ts`
2. Add methods to `src/app/lib/mockApi.ts`
3. Create adapter in `src/app/lib/data/[entity].ts` with real API fallback
4. Create custom hook `src/hooks/use[Entity].ts`
5. Create form component `src/components/[entity]/[Entity]Form.tsx`
6. Create pages in `src/app/(main)/[entity]/` and `src/app/(main)/[entity]/[id]/`
7. Add navigation link to `src/components/layout/Sidebar.tsx`

### Testing with Demo Accounts
Two demo accounts pre-loaded in mockApi:
- Admin: `admin@demo.com` / `adm_123`
- Operator: `op@demo.com` / `op123`

Login page has quick-fill buttons for both roles.

### Backend Integration
Per-entity mock flags allow gradual migration. When a real endpoint is ready:
1. Update the Backend DTO types and normalization functions (`normalizeClient()`, `toBackendClient()`) in the entity's data adapter
2. Set the entity flag to `'false'` (e.g., `NEXT_PUBLIC_USE_MOCK_CLIENTS=false`)
3. Data adapters fall back to mock automatically on error via `logMockFallback()` (dev-only warning)

## Key Implementation Notes

- **Axios interceptors** (`src/app/lib/axios.ts`) automatically inject Bearer token from localStorage — no manual header passing needed
- **`resolveMockMode()`** in `src/app/lib/data/source.ts` is the single source of truth for mock/real resolution: per-entity env var overrides `NEXT_PUBLIC_USE_MOCK` global
- **Mock API delays** use `wait()` to simulate network latency — do not remove, they make UX feedback testable
- **Toast API**: `notify.promise()`, `notify.success()`, `notify.error()` from `src/app/lib/notify.ts`
