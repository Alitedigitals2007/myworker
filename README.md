# MY WORKER

A premium, mobile-first **worker management & sales platform** built with Next.js 15.
Built for the feel of WhatsApp's real-time comms, Notion's clean IA, Linear's polish, and Stripe's analytics discipline.

> See [`SPEC.md`](./SPEC.md) for the full product specification.

---

## Features

- **Auth** — Admin & Worker logins, optional face verification via webcam, optional 2FA
- **Dashboards** — Admin stats grid + charts, worker earnings/tasks summary
- **Worker Management** — Add/edit workers, face capture, status & commission control
- **Products & Inventory** — Variants, stock movements, low-stock alerts
- **Sales Module** — Multi-step sale creation, pending review, approve/reject workflow
- **Commission System** — Percentage, fixed, or per-product overrides; auto-calculated
- **Payments** — Initiate, approve, and track worker payments
- **Analytics** — Revenue, sales, worker performance, profit/loss (Recharts)
- **Chat** — WhatsApp-style private & group chat, real-time via Pusher
- **Announcements & Complaints** — Targeted broadcasts, complaint tracking
- **Google Sheets Sync** — Bidirectional sync with conflict resolution
- **Reports** — Export as Excel, CSV, or styled PDF
- **Activity Logs** — Auth, CRUD, and sensitive operation auditing

---

## Tech Stack

| Layer        | Tech                                            |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 15 (App Router) + React 18              |
| Language     | TypeScript 5.6                                  |
| Styling      | Tailwind CSS 3 + tailwindcss-animate            |
| UI           | Radix UI primitives, Lucide icons               |
| Forms        | React Hook Form + Zod                           |
| Charts       | Recharts                                        |
| Database     | Neon PostgreSQL + Prisma ORM 6                  |
| Auth         | NextAuth 5 (beta) + bcryptjs                    |
| Real-time    | Pusher                                          |
| File storage | Cloudinary                                      |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon, Supabase, or local)

### Install

```bash
npm install
```

### Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables (see `.env.example`):

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — session signing secret
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # create/update schema
npm run db:seed       # optional: seed admin user
```

### Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### Other scripts

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm run build`     | Production build                    |
| `npm run start`     | Run the production build            |
| `npm run lint`      | ESLint via `next lint`              |
| `npm run db:studio` | Open Prisma Studio                  |
| `npm run db:seed`   | Seed the database                   |

---

## Project Structure

```
src/
  app/                 # Next.js App Router (pages, layouts, API routes)
  components/
    ui/                # shadcn/ui-style primitives
    shared/            # cross-cutting components
    dashboard/         # admin dashboard widgets
    workers/           # worker management UI
    products/          # product/inventory UI
    sales/             # sales flow UI
    analytics/         # charts & reports
    chat/              # real-time chat UI
  lib/
    utils/             # helpers
    validations/       # Zod schemas
    hooks/             # custom React hooks
    api/               # API client wrappers
  store/               # global state (Zustand)
  types/               # shared TypeScript types
prisma/
  schema.prisma        # data model
```

---

## License

Private. (c) MY WORKER.
