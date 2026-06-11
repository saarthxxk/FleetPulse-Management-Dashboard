# FleetPulse

An internal fleet management dashboard for operations teams to monitor vehicles in real time, review trip history, and track vehicle health.

Built as a frontend internship assignment for Bytebeam.

---

## Live URL

> Add your deployed URL here after deploying to Vercel / Netlify

---

## Demo Login

```
Email:    ops@fleetpulse.io
Password: fleetpulse2024
```

> Create this user in your Supabase Auth dashboard and add a matching row to the `profiles` table.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, no config file) |
| State | Zustand 5 |
| Data fetching | Custom hooks with Supabase REST + polling |
| Map | react-leaflet 5 + Leaflet 1.9 |
| Auth | Supabase Auth |
| Backend | Supabase (Postgres + RLS) |

---

## Supabase Setup

### 1. Create tables

Run the following in the Supabase SQL editor:

```sql
-- Profiles (mirrors auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'operator')),
  created_at timestamptz default now()
);

-- Vehicles
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  registration_number text unique not null,
  vehicle_type text not null check (vehicle_type in ('truck', 'van', 'motorcycle')),
  current_lat float not null,
  current_lng float not null,
  current_speed float not null default 0,
  fuel_level float not null default 100,
  battery_level float not null default 100,
  health_status text not null check (health_status in ('ok', 'warning', 'critical', 'offline')) default 'ok',
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- Trips
create table trips (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  start_lat float not null,
  start_lng float not null,
  end_lat float,
  end_lng float,
  distance_km float,
  duration_minutes float,
  status text not null check (status in ('in_progress', 'completed', 'cancelled')) default 'in_progress'
);

-- Trip locations (breadcrumbs)
create table trip_locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  lat float not null,
  lng float not null,
  speed float not null default 0,
  recorded_at timestamptz not null default now()
);

-- Vehicle alerts
create table vehicle_alerts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  trip_id uuid references trips(id) on delete set null,
  type text not null,
  severity text not null check (severity in ('warning', 'critical')),
  message text not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
```

### 2. Enable RLS and add policies

```sql
-- Enable RLS on all tables
alter table profiles       enable row level security;
alter table vehicles       enable row level security;
alter table trips          enable row level security;
alter table trip_locations enable row level security;
alter table vehicle_alerts enable row level security;

-- Authenticated users can read everything
create policy "Authenticated read" on vehicles       for select using (auth.role() = 'authenticated');
create policy "Authenticated read" on trips          for select using (auth.role() = 'authenticated');
create policy "Authenticated read" on trip_locations for select using (auth.role() = 'authenticated');
create policy "Authenticated read" on vehicle_alerts for select using (auth.role() = 'authenticated');

-- Profiles: users can only read their own row
create policy "Own profile" on profiles for select using (auth.uid() = id);

-- Service role (seeder) needs full access — use service key in seeder for production
-- For MVP: disable RLS on vehicles/trips/trip_locations/vehicle_alerts for seeder writes,
-- or add an insert policy for anon role (not recommended for production).
```

> **Note:** The seeder uses `VITE_SUPABASE_ANON_KEY`. For a production setup, use the service role key in the seeder and keep it out of the frontend bundle.

### 3. Create a demo user

1. Go to **Authentication → Users** in your Supabase dashboard
2. Create a user with email `ops@fleetpulse.io` and your chosen password
3. Copy the user's UUID
4. Run in SQL editor:
   ```sql
   insert into profiles (id, full_name, role)
   values ('<user-uuid>', 'Ops Manager', 'operator');
   ```

### 4. Environment variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Running the app

```bash
npm install
npm run dev
```

---

## Running the seeder

The seeder simulates 12 vehicles moving along Delhi NCR routes and generates health alerts periodically.

```bash
# Install seeder dependencies (dotenv needed)
npm install

# Run seeder — keep this terminal open while demoing
node seed/simulate.js
```

The seeder:
- Upserts 12 vehicles on first run (7 ok, 3 warning, 1 critical, 1 offline)
- Seeds one in-progress trip per active vehicle
- Advances each vehicle along its route every 10 seconds
- Inserts `trip_locations` breadcrumbs on every tick
- Fires a random `vehicle_alerts` event every ~20 ticks
- Updates `health_status` on the vehicle when an alert fires

---

## Architecture decisions

### Map always mounted
`MapView` is never unmounted. The `VehicleDetailPanel` is `position: absolute` over the map — it doesn't push or replace it. This avoids Leaflet re-initialization on every vehicle click.

### Atomic vehicle selection
`selectVehicle(id)` in Zustand always resets `selectedTripId` to null simultaneously. There is no separate setter for `selectedVehicleId`. This prevents a stale trip route from a previous vehicle appearing on the new selection.

### Polling over WebSockets
Vehicles and alerts poll every 15 seconds via `setInterval`. This is the correct tradeoff for an MVP: no WebSocket infra, predictable behavior, easy to reason about. The `ConnectionIndicator` surfaces staleness if polling falls behind.

### Denormalized health status
`vehicles.health_status` is stored directly on the vehicle row even though `vehicle_alerts` contains the same signal. This means the fleet list query is a simple `SELECT *` with no join. The seeder updates both when an alert fires.

### No vehicles page
The sidebar with inline search replaces a separate vehicles table page. This keeps the user's spatial context (the map) always visible.

---

## AI tools used

Claude (Anthropic) was used throughout this project for:

- **Product discovery**: defining the core user, workflows, and MVP scope
- **Schema design**: reasoning through table structure, field choices, and tradeoffs
- **Architecture design**: component tree, state shape, hook responsibilities
- **Code generation**: all component implementations were generated and then reviewed and adapted

All generated code was reviewed, integrated, and tested manually. Architecture decisions were made collaboratively through a structured discovery process before any code was written.