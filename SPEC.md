# MY WORKER - Product Specification

## Concept & Vision

MY WORKER is a premium, mobile-first worker management and sales platform that combines the intuitive feel of WhatsApp's real-time communication, Notion's clean information architecture, Linear's polished interface, and Stripe Dashboard's professional analytics. The application feels like a native mobile app while being a powerful web platform deployed on Vercel—fast, responsive, and delightfully smooth.

The design language speaks "professional elegance meets modern utility"—every interaction should feel intentional, every animation purposeful, every screen balanced.

---

## Design Language

### Aesthetic Direction
Inspired by Linear's minimalism meets Stripe's sophistication—clean surfaces, subtle depth through shadows, generous whitespace, and micro-interactions that feel native. Glass effects used sparingly for elevation hierarchy only.

### Color Palette

**Light Mode:**
- Background: `#FAFBFC` (off-white)
- Card: `#FFFFFF`
- Border: `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Text Tertiary: `#9CA3AF`
- Primary: `#6366F1` (Indigo-500)
- Primary Hover: `#4F46E5`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

**Dark Mode:**
- Background: `#0F0F0F`
- Card: `#181818`
- Border: `#2D2D2D`
- Text Primary: `#FAFAFA`
- Text Secondary: `#A1A1A1`
- Text Tertiary: `#6B6B6B`
- Primary: `#818CF8` (Indigo-400)
- Primary Hover: `#6366F1`
- Success: `#34D399`
- Warning: `#FBBF24`
- Error: `#F87171`
- Info: `#60A5FA`

### Typography
- **Font Family:** Inter (Google Fonts) - clean, modern, highly legible
- **Fallbacks:** -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Scale:**
  - Display: 36px / 40px line-height / 700 weight
  - H1: 30px / 36px / 700
  - H2: 24px / 32px / 600
  - H3: 20px / 28px / 600
  - Body: 14px / 22px / 400
  - Small: 12px / 18px / 400
  - Caption: 11px / 16px / 500

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (xl)
- Card padding: 20px mobile, 24px desktop

### Motion Philosophy
- **Duration:** 150ms (micro), 200ms (standard), 300ms (emphasis), 500ms (dramatic)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for general, `cubic-bezier(0, 0, 0.2, 1)` for entrances
- **Principles:**
  - Entrance: fade + slight upward motion (8-16px)
  - Exit: fade + slight downward motion
  - State changes: 150ms color/shadow transitions
  - Page transitions: 300ms with staggered children
  - Skeleton loaders pulse at 1.5s intervals

### Visual Assets
- **Icons:** Lucide React (consistent 24px default, 20px compact, 16px inline)
- **Avatars:** Circular, 32px default, 40px on cards, 64px on profiles
- **Empty States:** Custom illustrations with muted colors + actionable text
- **Loading:** Skeleton screens matching content shape, subtle pulse animation

---

## Layout & Structure

### Mobile Layout (< 768px)
- Bottom navigation bar (56px height, safe area aware)
- Sticky headers with blur backdrop
- Full-width cards with 16px horizontal margins
- Stack layout with 12px gaps
- Floating action button (56px) bottom-right, 80px from bottom nav

### Tablet Layout (768px - 1024px)
- Collapsible sidebar (280px expanded, 72px collapsed)
- Top header with search + notifications
- Cards in 2-column grid
- 24px margins

### Desktop Layout (> 1024px)
- Persistent sidebar (280px)
- Main content with max-width 1400px centered
- 32px margins
- 3-4 column grids for dashboard cards

### Page Structure
1. **Header:** Logo, Global Search (cmd+k), Notifications bell, Profile dropdown
2. **Sidebar:** Navigation links with icons, active state highlight, collapse on tablet
3. **Content:** Scrollable area with sticky sub-headers where needed
4. **Bottom Nav (mobile):** 5 icons max, center icon for FAB alternative

---

## Features & Interactions

### Authentication

#### Admin Login
- Single page with centered card (400px max-width)
- Email + password fields with visibility toggle
- "Remember me" checkbox
- Forgot password link
- 2FA optional (totp code input after password)
- Error states: shake animation + red border + error message below field
- Success: fade out + redirect to dashboard

#### Worker Login
- Worker ID + password fields
- On first login: capture face via webcam, store encrypted biometric data
- On subsequent logins: Worker ID + password + face verification
- Face mismatch: red overlay flash + "Face not recognized" toast
- Success: redirect to worker dashboard

### Dashboard

#### Admin Dashboard
**Statistics Grid (2x4 on mobile, 4x4 on desktop):**
- Total Workers, Active Workers, Online Workers, New Workers (this month)
- Pending Reviews, Pending Complaints, Pending Payments
- Total Revenue, Total Sales, Total Products, Inventory Value
- Monthly Revenue, Monthly Profit, Pending Commission, Paid Commission

**Charts Section:**
- Revenue trend (area chart, 7/30/90 days)
- Sales trend (bar chart)
- Top performing workers (horizontal bar)
- Inventory status (donut)
- Commission distribution (pie)

**Quick Actions:**
- FAB on mobile with: Add Worker, New Sale, Add Product, Send Announcement

**Recent Activity Feed:**
- Real-time updates via Pusher
- Grouped by time (Now, Today, Earlier)

#### Worker Dashboard
- Welcome message with worker name + avatar
- Today's date + weather widget (decorative)
- Earnings summary cards (Today/Week/Month)
- Assigned tasks list
- Recent announcements (3 max, "View all" link)
- Pending commission badge
- Quick action buttons

**Bottom Navigation:**
- Home (dashboard)
- Chats
- Sales (creates new sale)
- Logs (personal activity)
- Profile

### Worker Management (Admin)

**List View:**
- Searchable, filterable data table
- Columns: Avatar+Name, ID, Department, Status, Commission, Actions
- Row click → Worker detail drawer (slide from right on mobile, modal on desktop)
- Bulk actions: Suspend, Activate, Export

**Add/Edit Worker Form:**
- Multi-step form (Personal Info → Employment → Verification)
- Profile photo upload with crop
- Face capture modal
- Real-time validation

**Fields:**
- Worker ID (auto-generated, editable)
- Full Name, Email, Phone
- Department (dropdown), Position (text)
- Address, Gender (radio), Date of Birth (date picker)
- Employment Date, Profile Picture, Status
- Commission Percentage, Commission Type

### Product Management

**Product List:**
- Card grid view (2 col mobile, 4 col desktop) or table view toggle
- Category filter tabs
- Search + sort

**Product Card:**
- Product image (1:1 ratio, rounded-xl)
- Product name + category badge
- Price (selling) + cost price on hover
- Stock indicator (green/yellow/red)
- Quick actions: Edit, View Variants, Disable

**Product Form:**
- Multi-step: Basic Info → Pricing → Variants → Media
- Auto-generate SKU option
- Variant builder with size/color matrices
- Drag-drop image upload (Cloudinary)

**Product Variants:**
- Expandable variant list
- Each variant: SKU, Image, Stock, Price
- Inline editing
- Bulk stock update

### Inventory

**Inventory Dashboard:**
- Total value card
- Stock status cards (In Stock, Low Stock, Out of Stock)
- Recent movements table
- Restock quick action

**Stock Movement:**
- Auto-update on sales approval
- Manual adjustment with reason
- History log per product

### Sales Module

**New Sale Form (Worker):**
- Step 1: Customer Info (Name, Phone - auto-complete from history)
- Step 2: Select Product → Select Variant → Quantity → Auto-calculate total
- Step 3: Apply discount (optional), Payment method, Notes
- Step 4: Review → Submit

**Sale Submission:**
- Status: "Pending Review"
- Upload receipt image
- Confirmation animation

**Admin Sales Review:**
- List view with status tabs (Pending, Approved, Rejected)
- Detail view: All sale info + customer + worker
- Actions: Approve (green), Reject (red with reason), Edit
- Approved sale → auto-update inventory, calculate commission

### Commission System

**Commission Types:**
- Percentage of sale
- Fixed amount per sale
- Per-product overrides

**Calculation (auto):**
- Sale amount × Commission % = Worker Commission
- Company Revenue = Sale amount - Worker Commission

**Commission Dashboard:**
- Pending (awaiting approval)
- Approved (ready for payment)
- Paid
- Rejected

### Payment Management

**Admin: Initiate Payment**
- Select worker → Enter amount → Payment method → Reference → Notes
- Bulk payment option

**Worker: Payment History**
- List with status badges
- Filter by date range, status
- Download receipt PDF

### Analytics

**Dashboards:**
- Revenue (today/week/month/year/custom range)
- Sales analytics
- Worker performance leaderboard
- Product performance
- Commission breakdown
- Profit/loss

**Charts (Recharts):**
- Area charts for trends
- Bar charts for comparisons
- Line charts for growth
- Responsive, touch-friendly

### Chat System

**Private Chat:**
- WhatsApp-style bubbles
- Read receipts (blue ticks)
- Typing indicator (animated dots)
- Voice notes (record button)
- Image/file sharing
- Emoji picker
- Message search

**Group Chat:**
- Department groups (auto-created)
- Custom groups
- Admin can pin message, delete others' messages
- Member list view

**Real-time:** Pusher channels for instant delivery

### Announcements

**Admin Create:**
- Title, content (rich text), attachments
- Target: All workers / Departments / Individuals
- Schedule for later option
- Preview before publish

**Worker View:**
- Notification badge
- Announcement list with unread indicator
- Detail view with images/files

### Complaint System

**Worker Submit:**
- Title, description
- Image attachments
- Status tracking

**Admin:**
- List with filters (Pending, Under Review, Resolved)
- Reply with solution
- Status update

### Notifications

**Real-time via Pusher:**
- Toast notifications (bottom-right desktop, top mobile)
- Notification center (bell icon)
- Badge counts on nav items

**Types:**
- New sale, Payment received, Announcement, Complaint reply
- Message, Commission approved, Worker added, Inventory alert

### Google Sheets Sync

**Setup:**
- Admin connects Google account
- Maps sheets to modules (Workers, Products, Sales, etc.)
- Column mapping interface

**Behavior:**
- Sheet edits → App updates (webhook polling every 30s)
- App changes → Sheet updates (on save)
- Bidirectional, conflict resolution (sheet wins with notification)

### Reports

**Export Formats:**
- Excel (.xlsx)
- CSV
- PDF (styled)

**Report Types:**
- Sales report (date range, worker, product)
- Worker report (attendance, sales, commission)
- Payment report
- Commission report
- Inventory report
- Complaint report
- Activity log report
- Revenue/profit report

### Search (Global)

**Command Palette (Cmd+K):**
- Fuzzy search across all entities
- Recent searches
- Quick actions (Go to Dashboard, New Sale, etc.)
- Keyboard navigation

### Activity Logs

**Logged Events:**
- Auth events (login, logout, failed attempts)
- CRUD operations on all entities
- Status changes
- Payment events

**View:**
- Filterable timeline
- Export option
- Retention: 90 days default

---

## Component Inventory

### Button
- **Variants:** Primary (solid), Secondary (outline), Ghost, Destructive
- **Sizes:** sm (32px), md (40px), lg (48px)
- **States:** Default, Hover (+shadow, slight lift), Active (pressed), Disabled (50% opacity), Loading (spinner)

### Input
- **Types:** Text, Email, Password (with toggle), Number, Date, Textarea, Select, Combobox
- **States:** Default, Focus (ring), Error (red border + message), Disabled, Loading

### Card
- **Base:** White background, border-radius-xl, soft shadow
- **Variants:** Default, Interactive (hover lift), Selected (primary border)
- **Padding:** 20px mobile, 24px desktop

### Modal / Dialog
- **Overlay:** Semi-transparent black with blur
- **Animation:** Scale + fade in
- **Sizes:** sm (400px), md (500px), lg (700px), full

### Toast
- **Types:** Success (green), Error (red), Warning (yellow), Info (blue)
- **Position:** Bottom-right desktop, top-center mobile
- **Duration:** 5s default, dismissible
- **Animation:** Slide in from right, fade out

### Skeleton
- **Animation:** Pulse (opacity 0.4 → 0.7)
- **Shapes:** Text (lines), Avatar (circle), Card (rounded rect)

### Avatar
- **Sizes:** xs (24px), sm (32px), md (40px), lg (64px), xl (96px)
- **Fallback:** Initials on colored background
- **Status:** Online (green dot), Offline (gray), Busy (red)

### Badge
- **Variants:** Default, Success, Warning, Error, Info
- **Sizes:** sm, md

### Navigation
- **Sidebar:** Icon + label, active state, collapse
- **Bottom (mobile):** 5 icons, center highlight
- **Tabs:** Horizontal scroll on mobile

### Table
- **Features:** Sort, filter, pagination, row selection
- **Responsive:** Horizontal scroll or card stack on mobile

### Charts
- **Library:** Recharts
- **Types:** Area, Bar, Line, Pie, Donut
- **Responsive:** Aspect ratio maintained

### Empty State
- **Structure:** Icon + Title + Description + Action button
- **Variants:** No data, No results, Error

### Loading Screen
- **Animated logo** + **app name** + **progress indicator**

---

## Technical Approach

### Frontend Architecture
```
/src
  /app                    # Next.js 15 App Router
    /api                  # API routes
    /(auth)               # Auth group (login, etc.)
    /(dashboard)          # Protected routes
    /layout.tsx
    /page.tsx
  /components
    /ui                   # shadcn/ui components
    /shared               # Shared components
    /dashboard            # Dashboard-specific
    /workers              # Worker management
    /products             # Product management
    /sales                # Sales module
    /analytics            # Charts, reports
    /chat                 # Chat components
  /lib
    /utils                # Helpers
    /validations          # Zod schemas
    /hooks                # Custom hooks
    /api                  # API client
  /store                  # Zustand stores
  /types                  # TypeScript types
```

### Backend Architecture
- **API:** Next.js Route Handlers + Server Actions
- **Database:** Neon PostgreSQL + Prisma ORM
- **Auth:** Better Auth / Auth.js
- **Real-time:** Pusher
- **Files:** Cloudinary
- **Sheets:** Google Sheets API

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  role          Role      @default(WORKER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Worker {
  id                String    @id @default(cuid())
  workerId          String    @unique
  fullName          String
  email             String    @unique
  phone             String?
  department        String?
  position          String?
  address           String?
  gender            Gender?
  dateOfBirth       DateTime?
  employmentDate    DateTime?
  profilePicture    String?
  faceData          String?   @encrypted
  status            Status    @default(ACTIVE)
  commissionPercent Float     @default(10)
  commissionType    CommissionType @default(PERCENTAGE)
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  sales             Sale[]
  payments          Payment[]
  complaints        Complaint[]
  messages          Message[]
  activities        ActivityLog[]
  notifications     Notification[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Product {
  id              String    @id @default(cuid())
  name            String
  category        String
  sku             String    @unique
  sellingPrice    Float
  costPrice       Float
  description     String?
  images          String[]
  commissionType  CommissionType @default(PERCENTAGE)
  commissionValue Float?
  status          Status    @default(ACTIVE)
  variants        ProductVariant[]
  saleItems       SaleItem[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  sku         String   @unique
  name        String
  image       String?
  stock       Int      @default(0)
  price       Float
  attributes  Json
  saleItems   SaleItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Sale {
  id              String    @id @default(cuid())
  workerId        String
  worker          Worker    @relation(fields: [workerId], references: [id])
  customerName    String
  customerPhone   String?
  items           SaleItem[]
  totalAmount     Float
  discount        Float     @default(0)
  status          SaleStatus @default(PENDING)
  paymentMethod   String?
  receiptUrl      String?
  notes           String?
  commission      Float     @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model SaleItem {
  id              String    @id @default(cuid())
  saleId          String
  sale            Sale      @relation(fields: [saleId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  variantId       String?
  variant         ProductVariant? @relation(fields: [variantId], references: [id])
  quantity        Int
  unitPrice       Float
  totalPrice      Float
  createdAt       DateTime  @default(now())
}

model Payment {
  id              String    @id @default(cuid())
  workerId        String
  worker          Worker    @relation(fields: [workerId], references: [id])
  amount          Float
  paymentMethod   String
  reference       String?
  status          PaymentStatus @default(PENDING)
  notes           String?
  processedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Complaint {
  id              String    @id @default(cuid())
  workerId        String
  worker          Worker    @relation(fields: [workerId], references: [id])
  title           String
  description     String
  images          String[]
  status          ComplaintStatus @default(PENDING)
  response        String?
  resolvedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Announcement {
  id              String    @id @default(cuid())
  title           String
  content         String
  images          String[]
  targetType      TargetType @default(ALL)
  targetIds       String[]
  createdBy       String
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Message {
  id              String    @id @default(cuid())
  chatId          String
  senderId        String
  sender          Worker    @relation(fields: [senderId], references: [id])
  content         String
  type            MessageType @default(TEXT)
  attachments     String[]
  readBy          String[]
  createdAt       DateTime  @default(now())
}

model Chat {
  id              String    @id @default(cuid())
  type            ChatType  @default(PRIVATE)
  name            String?
  participants    String[]
  lastMessage     String?
  lastMessageAt   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Notification {
  id              String    @id @default(cuid())
  workerId        String?
  worker          Worker?   @relation(fields: [workerId], references: [id])
  type            NotificationType
  title           String
  message         String
  data            Json?
  read            Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

model ActivityLog {
  id              String    @id @default(cuid())
  workerId        String?
  worker          Worker?   @relation(fields: [workerId], references: [id])
  action          String
  entityType      String
  entityId        String?
  details         Json?
  ipAddress       String?
  createdAt       DateTime  @default(now())
}

model GoogleSheetSync {
  id              String    @id @default(cuid())
  sheetId         String    @unique
  name            String
  module          String
  lastSyncAt      DateTime?
  config          Json
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  WORKER
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum CommissionType {
  PERCENTAGE
  FIXED
  PER_PRODUCT
}

enum SaleStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ComplaintStatus {
  PENDING
  UNDER_REVIEW
  RESOLVED
}

enum TargetType {
  ALL
  DEPARTMENT
  INDIVIDUAL
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  VOICE
}

enum ChatType {
  PRIVATE
  GROUP
  DEPARTMENT
}

enum NotificationType {
  SALE
  PAYMENT
  ANNOUNCEMENT
  COMPLAINT
  MESSAGE
  COMMISSION
  WORKER_ADDED
  INVENTORY_ALERT
}
```

### API Design

**Authentication:**
- `POST /api/auth/login` - Admin/Worker login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-face` - Face verification
- `POST /api/auth/2fa` - 2FA verification

**Workers:**
- `GET /api/workers` - List workers (paginated, filtered)
- `POST /api/workers` - Create worker
- `GET /api/workers/:id` - Get worker details
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `POST /api/workers/:id/reset-face` - Reset face data
- `POST /api/workers/:id/reset-password` - Reset password

**Products:**
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product with variants
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/variants` - Add variant
- `PUT /api/products/:id/variants/:vid` - Update variant

**Sales:**
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id` - Update sale
- `POST /api/sales/:id/approve` - Approve sale
- `POST /api/sales/:id/reject` - Reject sale

**Payments:**
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `POST /api/payments/:id/approve` - Approve payment

**Analytics:**
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/workers` - Worker performance

**Chat:**
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - Get messages
- `POST /api/chats/:id/messages` - Send message

**Google Sheets:**
- `POST /api/sheets/connect` - Connect sheet
- `POST /api/sheets/sync` - Trigger sync
- `GET /api/sheets/status` - Sync status

---

## Security Considerations

- Passwords hashed with bcrypt (12 rounds)
- Session-based auth with HTTP-only cookies
- CSRF tokens on all mutations
- Rate limiting (100 req/min general, 5 req/min auth)
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS prevention via React's default escaping
- Content Security Policy headers
- Secure file upload (validate type, size, scan)
- Face data encrypted at rest
- Audit log for sensitive operations