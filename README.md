# Employee Reward & Recognition — Frontend

This repository contains the frontend for an Employee Reward and Recognition system built with Next.js (app router + TypeScript).


## Prerequisites

- Node.js 18 or later
- npm (or pnpm/yarn) installed

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Run the development server

```bash
npm run dev
```

3. Open in browser

http://localhost:3000

## Scripts

- `dev` — Runs Next.js in development mode
- `build` — Builds the production bundle
- `start` — Starts the production server (after `build`)

See `package.json` for full script details.

## Project Structure

```
as-4_frontend_nextjs/
│
├── app/                              # Routes (Next.js App Router)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   ├── (auth)/                       # Auth route group (no sidebar/navbar)
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/                  # Main app route group (with sidebar/navbar)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── control-panel/page.tsx
│   │   ├── history/page.tsx
│   │   ├── redeem/page.tsx
│   │   ├── review/page.tsx
│   │   ├── settings/page.tsx
│   │   └── wallet/page.tsx
│   ├── (admin)/                      # Admin route group
│   │   ├── layout.tsx
│   │   ├── departments/page.tsx
│   │   ├── designations/page.tsx
│   │   ├── employees/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── reward-categories/page.tsx
│   │   └── rewards/page.tsx
│   └── profile/page.tsx
│
├── components/                       # All UI components
│   ├── ui/                           # Generic primitives (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── avatar.tsx
│   ├── layout/                       # App shell components
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── features/                     # Domain-specific components
│       ├── auth/
│       │   └── ProtectedRoute.tsx
│       ├── dashboard/
│       │   ├── DashboardCard.tsx
│       │   ├── LeaderboardCard.tsx
│       │   ├── LeaderboardSection.tsx
│       │   ├── RecognitionCard.tsx
│       │   └── RecognitionSection.tsx
│       └── rewards/
│           └── RewardDialog.tsx
│
├── providers/                        # React context providers
│   └── AuthProvider.tsx
│
├── services/                         # API communication layer
│   ├── api-client.ts                 # Axios instance + interceptors
│   ├── auth-service.ts               # Login, register, reset password
│   ├── employee-service.ts           # Employee CRUD
│   ├── review-service.ts             # Reviews API
│   ├── review-orchestrator.ts        # Multi-step review logic
│   └── cloudinary.ts                 # Image uploads
│
├── types/                            # Shared TypeScript interfaces
│   ├── auth.ts                       # User, LoginResponse, etc.
│   ├── employee.ts                   # Employee, Department, etc.
│   ├── review.ts                     # Review, ReviewStatus, etc.
│   └── reward.ts                     # Reward, RewardCategory, etc.
│
├── hooks/                            # Custom React hooks
│   ├── use-auth.ts                   # Auth state & actions
│   └── use-employee.ts              # Employee data fetching
│
├── lib/                              # Pure utility functions
│   ├── utils.ts                      # cn(), formatDate(), etc.
│   └── role-utils.ts                 # Role/permission helpers
│
├── config/                           # App-wide constants
│   └── constants.ts                  # API URLs, roles enum, etc.
│
└── public/                           # Static assets
    ├── logo.svg
    └── images/
```

## Environment

Add runtime environment variables to a `.env.local` file at the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_EMPLOYEE_API_URL=http://localhost:8002
NEXT_PUBLIC_WALLET_API_URL=http://localhost:8004
NEXT_PUBLIC_RECOGNITION_API_URL=http://localhost:8005
NEXT_PUBLIC_REWARDS_API_URL=http://localhost:8003
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```
