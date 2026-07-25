# AgnosHealth — Real-Time Patient Intake System

A responsive, real-time patient information form and staff monitoring dashboard built with Next.js 15, TypeScript, TailwindCSS v4, and WebSocket.

> **Assignment**: Agnos Healthcare — Front-end Developer Candidate Assignment

## 🔗 Links

| | Link |
|:---|:---|
| **Live Application** | [https://agnos-frontend.vercel.app](https://agnos-frontend.vercel.app) |
| **Code Repository** | [GitHub](https://github.com/YOUR_USERNAME/agnos-frontend) |
| **Patient Form** | `/patient` |
| **Staff Dashboard** | `/staff` |

---

## 📋 Project Overview

The system consists of **two main interfaces** that synchronize in real-time:

1. **Patient Form** (`/patient`) — A responsive form where patients enter their personal information (13 fields). Includes real-time validation, progress tracking, and status management.

2. **Staff View** (`/staff`) — A real-time dashboard for staff to monitor all connected patients. Displays live data updates, status indicators, and filter controls.

### How It Works

```
┌──────────────┐       WebSocket        ┌────────────────┐       WebSocket       ┌──────────────┐
│  Patient A   │──────────────────────▶  │    Server       │ ◀─────────────────── │  Staff View  │
│  /patient    │  sends form data        │  (WebSocketHub) │   receives updates   │  /staff      │
└──────────────┘                         │  In-memory Map  │                      └──────────────┘
┌──────────────┐       WebSocket        │                 │
│  Patient B   │──────────────────────▶  │                 │
│  /patient    │                         └────────────────┘
└──────────────┘
```

Patients type into the form → data is sent via WebSocket (debounced at 300ms) → server broadcasts to all connected staff views → staff see the data update with flash animations in real-time.

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|:---|:---|:---|
| [Next.js](https://nextjs.org/) | 15.5 | React framework (App Router) |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [TailwindCSS](https://tailwindcss.com/) | 4.x | Utility-first CSS |
| [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) | — | Real-time communication |
| [@vercel/functions](https://vercel.com/docs/functions) | 2.x | Serverless WebSocket (production) |
| [ws](https://github.com/websockets/ws) | — | WebSocket server (development) |
| [Vercel](https://vercel.com/) | — | Cloud deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18+ (recommended: 20.x or later)
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agnos-frontend.git
cd agnos-frontend

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

This single command starts **both**:
- Next.js dev server on `http://localhost:3000`
- WebSocket dev server on `ws://localhost:3001` (auto-started via `instrumentation.ts`)

Then open two browser windows:
- **Patient Form**: [http://localhost:3000/patient](http://localhost:3000/patient)
- **Staff Dashboard**: [http://localhost:3000/staff](http://localhost:3000/staff)

> **Tip**: Place the windows side-by-side to see real-time synchronization in action.

### Build for Production

```bash
npm run build
npm run start
```

### Available Scripts

| Script | Description |
|:---|:---|
| `npm run dev` | Start development server (Next.js + WebSocket) |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Environment Variables

No environment variables are required. The WebSocket URL is auto-detected:
- **Local dev**: `ws://localhost:3001`
- **Production**: `wss://<your-domain>/api/ws`

---

## 📁 Project Structure

```
agnos-frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/ws/route.ts         # WebSocket endpoint (Vercel production)
│   │   ├── patient/page.tsx        # Patient form page (Server Component + SEO metadata)
│   │   ├── staff/page.tsx          # Staff dashboard page (Server Component + SEO metadata)
│   │   ├── layout.tsx              # Root layout (fonts, global metadata)
│   │   ├── globals.css             # Global styles, CSS variables, animations
│   │   └── page.tsx                # Landing / home page
│   │
│   ├── components/                 # React UI Components
│   │   ├── PatientForm.tsx         # Patient form with 13 fields, dropdowns, submit logic
│   │   ├── StaffDashboard.tsx      # Dashboard with stats, filter tabs, patient grid
│   │   ├── PatientCard.tsx         # Individual patient card with field change flash
│   │   ├── FormField.tsx           # Reusable form input (text/select/date/textarea)
│   │   ├── StatusIndicator.tsx     # Status badge (Filling/Inactive/Submitted)
│   │   └── Navbar.tsx              # Navigation bar with connection indicator
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useWebSocket.ts         # WebSocket connection, auto-reconnect, tab dedup
│   │   └── usePatientForm.ts       # Form state, validation, debounced WS sync
│   │
│   ├── lib/                        # Shared Utilities
│   │   ├── types.ts                # TypeScript interfaces (PatientFormData, messages)
│   │   ├── validation.ts           # Field-level + form-level validation rules
│   │   ├── ws-handler.ts           # Shared WebSocketHub class (DRY server logic)
│   │   └── dev-ws.ts               # Dev WebSocket server (auto-started by instrumentation)
│   │
│   ├── types/                      # Type declarations
│   │   └── vercel.d.ts             # Vercel Functions type augmentations
│   │
│   └── instrumentation.ts          # Next.js instrumentation (auto-starts dev WS server)
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts              # TailwindCSS v4 configuration
└── README.md
```

### Key Architectural Decisions

| Decision | Reasoning |
|:---|:---|
| **App Router** (not Pages Router) | Modern Next.js pattern; Server Components for pages, Client Components for interactive parts |
| **Server Components for pages** | `patient/page.tsx` and `staff/page.tsx` are Server Components that export SEO metadata, wrapping Client Component children |
| **Single `WebSocketHub` class** | DRY principle — both dev server and Vercel route share the same message handling logic |
| **`instrumentation.ts`** for dev WS | Next.js runs this once on startup — perfect for launching the dev WebSocket server automatically |
| **`sessionStorage` tab ID** | Prevents ghost sessions when users navigate back and forth within the same tab |

---

## 🎨 Design Decisions (UI/UX)

### Responsive Design

The UI adapts to three breakpoint ranges:

| Viewport | Patient Form | Staff Dashboard |
|:---|:---|:---|
| **Mobile** (< 640px) | Single column layout, full-width fields | Single column card grid, stacked stats |
| **Tablet** (640–1024px) | Two-column grid for fields | Two-column card grid |
| **Desktop** (> 1024px) | Two-column grid, centered max-w-2xl | Three-column card grid, max-w-7xl |

### Design Principles

- **Clean medical aesthetic**: Neutral palette (`#001a33` navy, `#63707c` gray) with accent colors for status
- **Accessibility**: Proper `aria-invalid`, `aria-describedby`, semantic HTML (`<fieldset>`, `<legend>`), `role="alert"` for errors
- **Required field indicator**: Red asterisk (`*`) for required fields + "(Optional)" label for others — standard medical form convention
- **Progressive feedback**: Progress bar, green submit button at 100%, scroll-to-first-error on validation failure
- **Status colors**: 🟢 Emerald = Active/Filling, 🟡 Amber = Inactive, 🔵 Sky = Submitted

### Form UX Features

- **Dropdown selects** for Gender, Language, Nationality, Religion — reduces input errors
- **Real-time validation** on field change with debounce
- **Scroll-to-error**: On submit failure, auto-scrolls to the first invalid field and focuses it
- **Dynamic submit button**: Turns green with ✓ icon when form reaches 100% completion
- **Inactivity detection**: After 30s of no typing, status changes to "Inactive"

---

## ⚡ Real-Time Synchronization Flow

### Connection Lifecycle

```
1. Patient opens /patient
   └─▶ useWebSocket connects to WS server
       └─▶ Sends: { type: "register", role: "patient", tabId: "tab-xxx" }
           └─▶ Server: creates PatientSession, broadcasts to staff
               └─▶ Staff receives: { type: "patient:updated", patient: {...} }

2. Patient types in a field
   └─▶ usePatientForm updates local state immediately (optimistic)
       └─▶ Debounced (300ms): sends { type: "patient:update", data: {...} }
           └─▶ Server: updates session, broadcasts to staff
               └─▶ Staff: PatientCard shows flash animation on changed fields

3. Patient stops typing for 30s
   └─▶ usePatientForm sends: { type: "patient:status", status: "inactive" }
       └─▶ Server: updates status, broadcasts to staff
           └─▶ Staff: StatusIndicator changes to amber "Inactive"

4. Patient submits form
   └─▶ Validates all fields → scrolls to first error if invalid
   └─▶ If valid: sends final data + { status: "submitted" }
       └─▶ Staff: StatusIndicator changes to blue "Submitted"

5. Patient closes tab / navigates away
   └─▶ beforeunload → ws.close(1000)
       └─▶ Server: removes session, broadcasts "patient:disconnected"
           └─▶ Staff: card disappears from dashboard
```

### Deduplication Strategy

Each browser tab generates a unique `tabId` stored in `sessionStorage`. When a patient reconnects (e.g., navigates back), the server matches the `tabId` and **replaces** the old session instead of creating a duplicate.

### Auto-Reconnect

If the WebSocket connection drops, the client automatically reconnects with **exponential backoff** (1s → 2s → 4s → ... → max 30s). On reconnect, the client re-registers and the server re-syncs state.

### Dual WebSocket Architecture

| Environment | Transport | Code |
|:---|:---|:---|
| **Local Dev** (`next dev`) | `ws` package on port 3001 | `src/lib/dev-ws.ts` |
| **Production** (Vercel) | `@vercel/functions` `experimental_upgradeWebSocket` | `src/app/api/ws/route.ts` |

Both use the **shared `WebSocketHub`** class (`src/lib/ws-handler.ts`) — zero duplicated logic.

---

## ✨ Features & Bonus Features

### Core Requirements ✅

- [x] Patient form with all required fields (13 fields)
- [x] Real-time synchronization via WebSocket
- [x] Status indicators: **Filling** (green), **Inactive** (amber), **Submitted** (blue)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Deployed on Vercel (frontend cloud platform)

### Bonus Features ✅

- [x] **Form progress bar** — visual completion percentage for required fields
- [x] **Field flash animations** — changed fields briefly highlight on staff view
- [x] **Filter tabs on staff dashboard** — filter patients by status (All/Active/Inactive/Submitted)
- [x] **Auto-reconnect** with exponential backoff
- [x] **Connection status indicator** — visible on all pages (Connecting/Connected/Disconnected)
- [x] **Scroll-to-error** — auto-scroll + focus to first invalid field on submit
- [x] **Dynamic submit button** — changes to green with ✓ at 100% completion
- [x] **Tab deduplication** — prevents ghost sessions via `sessionStorage` tab ID
- [x] **Inactivity detection** — auto-changes status after 30s of no input
- [x] **SEO metadata** — proper `<title>` and `<meta description>` on each page
- [x] **React performance optimization** — `React.memo`, `useMemo` for components and computed values
- [x] **DRY WebSocket logic** — shared `WebSocketHub` class used by both dev and production servers
- [x] **Accessibility** — `aria-invalid`, `aria-describedby`, semantic HTML, keyboard navigable

---

## ⚠️ Known Limitations

1. **In-memory state**: Patient sessions live in server memory. If the Vercel Function cold-starts, existing sessions are lost. A production system would use Redis/Upstash.
2. **Single function instance**: On Vercel, WebSocket connections are pinned to one function instance. With high traffic, patients and staff might be routed to different instances and not see each other. Redis Pub/Sub would solve this.
3. **No persistence**: Form data is not saved to a database — this is scoped to the assignment requirements.

---

## 📄 License

This project was created as part of the Agnos Healthcare frontend developer assignment.
