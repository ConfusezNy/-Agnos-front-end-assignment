# Development Planning Documentation

## 1. Project Structure

### Folder Organization

The project follows Next.js 15 App Router conventions with a clean separation of concerns:

```
src/
├── app/              → Pages, layouts, and API routes (Next.js App Router)
├── components/       → Reusable React components (with React.memo optimization)
├── hooks/            → Custom React hooks for shared logic
├── lib/              → Utilities, types, validation, and shared WebSocket handler
├── types/            → TypeScript declaration files
└── instrumentation.ts → Auto-starts dev WebSocket server on `next dev`
```

### Key Files

| File | Purpose |
|:---|:---|
| `src/app/api/ws/route.ts` | WebSocket endpoint using `@vercel/functions`. Handles client connections, message routing, and in-memory state management. |
| `src/app/layout.tsx` | Root layout with Inter font (Google Fonts), SEO metadata, and global CSS import. |
| `src/app/page.tsx` | Landing page with navigation links to Patient Form and Staff View. |
| `src/app/patient/page.tsx` | Patient form page — renders `PatientForm` component. |
| `src/app/staff/page.tsx` | Staff dashboard page — renders `StaffDashboard` component. |
| `src/lib/types.ts` | All TypeScript interfaces: form data, WebSocket messages, patient sessions. |
| `src/lib/validation.ts` | Form validation functions with regex patterns for phone, email, etc. |
| `src/hooks/useWebSocket.ts` | WebSocket connection hook with auto-reconnect and environment-aware URL detection. |
| `src/hooks/usePatientForm.ts` | Form state management hook with debounced sync, inactivity detection, and scroll-to-error. |
| `src/lib/ws-handler.ts` | Shared `WebSocketHub` class — single source of truth for message handling, used by both dev and prod servers. |
| `src/lib/dev-ws.ts` | Development WebSocket server, auto-started via `instrumentation.ts`. |
| `src/instrumentation.ts` | Next.js instrumentation hook — launches the dev WS server once on startup. |

### Why This Structure?

- **Separation of concerns**: UI components, business logic (hooks), and utilities (lib) are clearly separated.
- **Colocation**: Page-specific files are colocated in the `app/` directory following Next.js conventions.
- **Reusability**: Components like `FormField` and `StatusIndicator` are generic and reusable.
- **Testability**: Pure functions in `lib/` can be unit-tested independently.

---

## 2. Design Decisions

### Color Palette

We chose a **medical/healthcare color palette** to convey trust and professionalism:

| Color | Hex | Usage |
|:---|:---|:---|
| Sky Blue | `#0EA5E9` | Primary actions, links, patient theme |
| Emerald | `#10B981` | Success states, active status, health |
| Amber | `#F59E0B` | Warning, inactive status |
| Rose | `#F43F5E` | Validation errors |
| Slate | `#F8FAFC` → `#0F172A` | Backgrounds and text |

**Rationale**: Blue is universally associated with healthcare and trust. Green represents health and success. This combination is commonly used in medical applications.

### Typography

- **Font**: Inter (via `next/font/google`) — clean, modern, highly readable at all sizes.
- **Scale**: Follows TailwindCSS default scale for consistency.

### Responsive Strategy

| Breakpoint | Width | Layout Changes |
|:---|:---|:---|
| **Mobile** | < 640px | Single column forms, stacked cards, full-width inputs |
| **Tablet** | 640px – 1023px | 2-column form grid, 2 cards per row in staff view |
| **Desktop** | ≥ 1024px | 2-column form with wider spacing, 3 cards per row |

**Design decisions by screen size:**

- **Mobile**: Prioritize readability and touch targets. All inputs are full-width. Navigation is compact. Cards stack vertically for easy scrolling.
- **Tablet**: Utilize horizontal space with 2-column grids. Form sections have adequate spacing. Stats bar uses 4-column grid.
- **Desktop**: Maximum information density. Staff dashboard shows 3 cards per row. Form has comfortable spacing with clear section boundaries.

### Form Layout

The patient form is organized into **4 logical sections** with visual separators:

1. 👤 **Personal Information** — Name, DOB, Gender
2. 📞 **Contact Information** — Phone, Email, Address
3. 🌍 **Preferences** — Language, Nationality, Religion
4. 🚨 **Emergency Contact** — Contact Name, Relationship

Each section has:
- An icon and heading for visual hierarchy
- A white card container with subtle border and shadow
- 2-column grid on tablet+ for efficient space usage

### Staff View Card Design

- **Header**: Avatar (first initial), patient name, connected time, status badge
- **Body**: All 13 fields grouped by section with compact labels
- **Interactions**: Flash animation on field updates, hover shadow effect
- **Empty state**: Centered illustration with descriptive text

---

## 3. Component Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── Landing Page (page.tsx)
│   └── Inline nav + hero section + cards
│
├── Patient Page (patient/page.tsx)
│   └── PatientForm
│       ├── Navbar (connectionState)
│       ├── Progress Bar
│       ├── FormField × 13 (per field)
│       └── Submit Button
│
└── Staff Page (staff/page.tsx)
    └── StaffDashboard
        ├── Navbar (connectionState)
        ├── Stats Bar (total, active, inactive, submitted)
        ├── Empty State (when no patients)
        └── PatientCard × N (per patient)
            ├── Card Header (avatar, name, status)
            ├── StatusIndicator
            └── Field Display × 13 (grouped by section)
```

### Component Descriptions

| Component | Responsibility |
|:---|:---|
| **PatientForm** | Orchestrates the entire patient form. Uses `usePatientForm` hook for state, validation, and WebSocket sync. Renders all 13 fields via `FormField`. Shows progress bar and submission success state. |
| **StaffDashboard** | Connects to WebSocket as staff role. Maintains a `Map` of patient sessions. Renders stats bar, **filter tabs** (All/Active/Inactive/Submitted), and patient card grid. Computes field changes in the message handler and passes `changedFields` as prop to PatientCard. |
| **PatientCard** | Displays a single patient's data in a card format. Wrapped in `React.memo`. Receives `changedFields` from parent and triggers flash animation. Shows all 13 fields grouped by section. |
| **FormField** | Generic form input wrapper wrapped in `React.memo`. Supports text, email, tel, date, select, and textarea types. Shows red asterisk (`*`) for required fields. Fully accessible with label, aria-invalid, aria-describedby, and role="alert". |
| **StatusIndicator** | Renders a status badge with color, icon, and label. Supports pulse animation for "filling" status. |
| **Navbar** | Navigation bar with logo, page links (with active state), and connection status indicator. |

### Custom Hooks

| Hook | Responsibility |
|:---|:---|
| **useWebSocket** | Manages WebSocket connection lifecycle. Auto-detects environment (dev/production) for URL. Implements reconnection with exponential backoff. Sends `tabId` (from `sessionStorage`) for deduplication. Provides typed `send` function. Handles `beforeunload` for clean disconnection. |
| **usePatientForm** | Manages all form state (data, errors, touched fields, submission). Debounces WebSocket updates (300ms). Tracks inactivity (30s timeout). Calculates form progress (`useMemo`). Returns `firstErrorField` on submit failure for scroll-to-error UX. |

### Data Flow

```
User types → handleFieldChange() → setState + validate → debounce 300ms → WebSocket send
                                                                              ↓
                                                                     Server receives
                                                                              ↓
                                                                     Broadcast to staff
                                                                              ↓
                                                              StaffDashboard.onMessage()
                                                                              ↓
                                                              Update patients Map → re-render
                                                                              ↓
                                                              PatientCard detects changes → flash
```

---

## 4. Real-Time Synchronization Flow

### WebSocket Connection Lifecycle

```
1. Client opens page → useWebSocket connects to /api/ws (or localhost:3001)
2. WebSocket opens → Client sends { type: 'register', role: 'patient' | 'staff', tabId: 'tab-xxx' }
   → Server deduplicates: if a session with the same tabId exists, it is removed first
3. Server creates session → Sends { type: 'connection:ack', sessionId }
4. If staff → Server also sends { type: 'patients:sync', patients: [...] }
5. Patient types → debounced → { type: 'patient:update', data: {...} }
6. Server receives → updates in-memory Map → broadcasts to all staff
7. 30s inactivity → Client sends { type: 'patient:status', status: 'inactive' }
8. Patient submits → { type: 'patient:status', status: 'submitted' }
9. Patient disconnects → Server broadcasts { type: 'patient:disconnected' }
10. Connection drops → Client auto-reconnects with exponential backoff
```

### Message Protocol

| Message | Direction | Trigger |
|:---|:---|:---|
| `register` | Client → Server | On WebSocket connect |
| `connection:ack` | Server → Client | After register |
| `patients:sync` | Server → Staff | After staff registers (initial data) |
| `patient:update` | Patient → Server → Staff | Patient types (debounced 300ms) |
| `patient:status` | Patient → Server → Staff | Status changes (filling/inactive/submitted) |
| `patient:disconnected` | Server → Staff | Patient closes tab/disconnects |

### Status Tracking

| Status | Trigger | Visual |
|:---|:---|:---|
| **Filling** 🟢 | Patient is actively typing | Green badge with pulse animation |
| **Inactive** 🟡 | No input for 30 seconds | Amber badge, no animation |
| **Submitted** ✅ | Patient clicks Submit | Blue badge, form locked |

### Reconnection Strategy

- On disconnect, client waits `reconnectDelay` before reconnecting
- Initial delay: **1 second**
- Each failed attempt: delay doubles (1s → 2s → 4s → 8s → ...)
- Maximum delay: **30 seconds**
- On successful reconnect: delay resets to 1 second
- On reconnect: client re-registers with role, staff receives full sync

### Architecture Diagram

```
┌──────────────┐                              ┌──────────────────────────┐
│              │    ws://...api/ws             │                          │
│   Patient    │ ────── register ───────────▶  │   WebSocket Server       │
│   Browser    │ ────── patient:update ─────▶  │   (Vercel Function or    │
│   (/patient) │ ────── patient:status ─────▶  │    local dev server)     │
│              │ ◀───── connection:ack ──────  │                          │
└──────────────┘                              │   In-Memory Store:       │
                                              │   ┌──────────────────┐   │
┌──────────────┐                              │   │ Map<id, Session> │   │
│              │    ws://...api/ws             │   └──────────────────┘   │
│   Staff      │ ────── register ───────────▶  │                          │
│   Browser    │ ◀───── connection:ack ──────  │   Connected Clients:     │
│   (/staff)   │ ◀───── patients:sync ──────  │   ┌──────────────────┐   │
│              │ ◀───── patient:updated ────  │   │ Map<id, Client>  │   │
│              │ ◀───── patient:status ─────  │   └──────────────────┘   │
│              │ ◀───── patient:disconnected   │                          │
└──────────────┘                              └──────────────────────────┘
```

### Production Considerations

- **Vercel Fluid Compute**: A single function instance handles multiple WebSocket connections, so patients and staff on the same instance share state naturally.
- **Multi-instance scaling**: For production with high traffic, use **Redis Pub/Sub** to broadcast messages across function instances.
- **Data persistence**: Currently uses in-memory storage. For production, integrate a database (e.g., PostgreSQL, MongoDB) to persist patient data.
