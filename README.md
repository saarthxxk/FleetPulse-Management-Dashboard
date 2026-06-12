# FleetPulse

A real-time fleet management dashboard for operations teams. Built as a frontend internship assignment for Bytebeam.

Operations teams use FleetPulse to answer three questions immediately on open:
- **Where are my vehicles right now?**
- **Does anything need attention?**
- **What has a specific vehicle been doing?**

The dashboard prioritizes urgent information first through alerts and health indicators, while keeping route and trip history one interaction away.

---

## Live Demo

| | |
|---|---|
| **URL** | https://fleet-pulse-management-dashboard.vercel.app/ |
| **Email** | `ops@fleetpulse.io` |
| **Password** | `fleetpulse2024` |

> The dashboard includes seeded fleet data. Running the simulator is optional and demonstrates live vehicle movement and alert generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 — `@tailwindcss/vite` plugin, no config file, `@theme` tokens in `index.css` |
| Global state | Zustand 5 |
| Map | react-leaflet 5 + Leaflet 1.9, CARTO dark tiles |
| Auth | Supabase Auth (email + password, email confirmation) |
| Database | Supabase (Postgres + Row Level Security) |
| Data fetching | Custom React hooks, REST polling every 15s |
| Router | React Router v7 |

---

## Project Structure

```
fleetpulse/
├── src/
│   ├── components/
│   │   ├── detail/      # VehicleDetailPanel, TelemetryGrid, TripList, HealthEventList
│   │   ├── layout/      # AlertStrip (KPI cards + alert feed), VehicleSidebar, ConnectionIndicator
│   │   ├── map/         # MapView, VehiclePin, RouteLayer, FlyToVehicle
│   │   ├── ui/          # EmptyState, SkeletonLoader, Spinner
│   │   └── vehicle/     # VehicleCard, HealthBadge, StatusDot, LastSeenTag
│   ├── hooks/           # useVehicles, useAlerts, useVehicleDetail, useRouteLayer, useAuth
│   ├── lib/             # supabase.ts (typed client), auth.ts (auth service)
│   ├── pages/           # LoginPage, DashboardPage
│   ├── router/          # ProtectedRoute
│   ├── store/           # useFleetStore (Zustand)
│   └── types/           # database.ts (Supabase types), index.ts (app types + enums)
├── seed/
│   └── simulate.js      # Node seeder — 12 vehicles, Delhi NCR routes, alert reconciliation
├── schema.sql           # Complete database schema — run this in Supabase SQL Editor
└── .env.local           # Your Supabase credentials (not committed, create manually)
```

---

## Local Setup

### 1. Extract the ZIP

Unzip the project and open the folder:

```
fleetpulse-submission.zip
└── fleetpulse/          ← open this folder in your terminal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a file named `.env.local` in the project root (next to `package.json`):

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Both values are found in your Supabase dashboard under **Project Settings → API**.

### 4. Set up the database

The full schema is in `schema.sql` at the root of the project.

Open your Supabase **SQL Editor**, paste the contents of `schema.sql`, and run it. This creates all five tables and the RLS policies in one step.

### 5. Create the demo user

1. Go to **Authentication → Users** in your Supabase dashboard
2. Click **Add user** → create `ops@fleetpulse.io` with password `fleetpulse2024`
3. Copy the generated UUID
4. Run this in the Supabase SQL Editor (replace the UUID):

```sql
insert into profiles (id, full_name, role)
values ('<paste-uuid-here>', 'Ops Manager', 'operator');
```

### 6. Configure Supabase redirect URL

Required so that verification emails link to the deployed app instead of localhost.

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `https://your-project.vercel.app`
3. Add `https://your-project.vercel.app/**` to **Redirect URLs**

### 7. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with the demo credentials.

---

## Running the Seeder

The seeder simulates 12 vehicles moving along real Delhi NCR road corridors. It must be running for the dashboard to show live vehicle movement, breadcrumb trails, and alerts.

Open a second terminal in the project folder and run:

```bash
node seed/simulate.js
```

Keep this terminal open while reviewing the dashboard.

**What the seeder does on each 10-second tick:**

- Advances each vehicle one step along its route
- Inserts a `trip_locations` breadcrumb for the route trail
- Degrades fuel and battery slightly each tick
- Checks actual telemetry against thresholds — creates alerts when breached, resolves them automatically when the vehicle recovers

**On startup the seeder:**

- Clears all stale open alerts from any previous run
- Upserts 12 vehicles (7 healthy, 3 warning, 1 critical, 1 offline)
- Creates one in-progress trip per active vehicle

**Alert thresholds:**

| Metric | Warning | Critical |
|---|---|---|
| Fuel level | ≤ 20% | ≤ 5% |
| Battery level | ≤ 30% | ≤ 15% |

---

## Key Architecture Decisions

### Map always mounted
`MapView` is never unmounted. `VehicleDetailPanel` is `position: absolute` overlaid on top — it doesn't push or replace the map. This avoids Leaflet re-initialization on every vehicle click, which causes a visible flash and resets the viewport.

### Atomic vehicle selection
`selectVehicle(id)` in Zustand always resets `selectedTripId` to `null` in the same operation. There is no separate setter for `selectedVehicleId`. This prevents a route from a previous vehicle's trip remaining on screen when a new vehicle is selected.

### Polling over WebSockets
Vehicles and alerts poll every 15 seconds via `setInterval`. For an MVP dashboard this is the right tradeoff: no WebSocket infrastructure, predictable behavior, and the `ConnectionIndicator` surfaces data staleness visually — amber after 20s, red after 60s.

### Denormalized health status
`vehicles.health_status` is stored directly on the vehicle row even though the same signal exists in `vehicle_alerts`. This means the fleet list query is a plain `SELECT *` with no joins. The seeder updates `health_status` whenever an alert is created or resolved, keeping both in sync.

### Profile created on first login, not on signup
With Supabase email confirmation enabled, the user has no active session immediately after `signUp()`. Inserting into `profiles` at that point would fail RLS. Instead, `full_name` is stored in `user_metadata` during signup, and the profile row is created on the first successful login after confirmation.

### Alert reconciliation in the seeder
Alerts are not generated randomly on a timer. The seeder checks actual fuel and battery values against defined thresholds every tick, creates alerts only when a condition is newly breached, and resolves them automatically when the vehicle recovers. This keeps the alert strip consistent with the telemetry shown in the detail panel.

---

## Tradeoffs

### Chosen
- Polling every 15s instead of WebSockets
- Single operator role
- Route history stored as trip breadcrumbs
- Vehicle health denormalized onto vehicle record

### Deferred
- Multi-role permissions
- Geofencing
- Maintenance scheduling
- Push notifications
- Fleet analytics

--

## AI Tools Used

Claude (Anthropic) was used throughout this project:

- **Product discovery** — defining the primary user, core workflows, and MVP scope before any code was written
- **Schema design** — reasoning through table structure, field ownership, and deliberate tradeoffs (e.g. denormalized `health_status`, scoping `trip_locations` to trips rather than vehicles)
- **Architecture design** — component tree, Zustand store shape, hook responsibilities, edge case planning
- **Code generation** — all component and hook implementations were generated then reviewed, debugged, and integrated manually
- **Debugging** — TypeScript errors, RLS policy issues, Leaflet rendering problems, and Supabase auth edge cases were diagnosed collaboratively

All generated code was read, understood, and tested before being used. No code was accepted without being reviewed.

--

## AI Chat Logs

- **Chat Link** - https://claude.ai/share/45ba1317-0308-41bc-876d-f2d4c518ccb5