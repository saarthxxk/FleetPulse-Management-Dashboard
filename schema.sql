-- FleetPulse — Database Schema
-- Run this entire file in your Supabase SQL Editor before starting the app.
-- Order matters: profiles → vehicles → trips → trip_locations → vehicle_alerts

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- profiles mirrors auth.users — one row per authenticated user
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  role       text not null check (role in ('admin', 'operator')),
  created_at timestamptz default now()
);

-- vehicles — primary entity, one row per physical vehicle
create table vehicles (
  id                  uuid primary key default gen_random_uuid(),
  registration_number text unique not null,
  vehicle_type        text not null check (vehicle_type in ('truck', 'van', 'motorcycle')),
  current_lat         float not null,
  current_lng         float not null,
  current_speed       float not null default 0,
  fuel_level          float not null default 100,
  battery_level       float not null default 100,
  health_status       text not null check (health_status in ('ok', 'warning', 'critical', 'offline')) default 'ok',
  last_seen_at        timestamptz not null default now(),
  is_active           boolean not null default true
);

-- trips — one row per journey, bounded by started_at / ended_at
create table trips (
  id               uuid primary key default gen_random_uuid(),
  vehicle_id       uuid not null references vehicles(id) on delete cascade,
  started_at       timestamptz not null,
  ended_at         timestamptz,
  start_lat        float not null,
  start_lng        float not null,
  end_lat          float,
  end_lng          float,
  distance_km      float,
  duration_minutes float,
  status           text not null check (status in ('in_progress', 'completed', 'cancelled')) default 'in_progress'
);

-- trip_locations — breadcrumb points recorded during a trip
create table trip_locations (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  lat         float not null,
  lng         float not null,
  speed       float not null default 0,
  recorded_at timestamptz not null default now()
);

-- vehicle_alerts — health events tied to a vehicle, optionally to a trip
create table vehicle_alerts (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references vehicles(id) on delete cascade,
  trip_id     uuid references trips(id) on delete set null,
  type        text not null,
  severity    text not null check (severity in ('warning', 'critical')),
  message     text not null,
  is_resolved boolean not null default false,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- RLS is enabled on profiles only for MVP.
-- The seeder runs with the anon key, so write tables (vehicles, trips,
-- trip_locations, vehicle_alerts) remain open.
-- For production: enable RLS on all tables and use the service role key in the seeder.

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ─── Demo user ────────────────────────────────────────────────────────────────
-- After creating ops@fleetpulse.io in Authentication → Users,
-- paste the generated UUID below and run this insert:
--
-- insert into profiles (id, full_name, role)
-- values ('<paste-uuid-here>', 'Ops Manager', 'operator');
