-- Business OS — Supabase schema
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- The app currently runs fully on local storage (see src/utils/persist.js).
-- These tables mirror that local shape 1:1, so wiring real persistence later
-- is a matter of swapping usePersistentState calls for supabase queries —
-- no data-model redesign needed.

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists stock (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size text,
  unit text not null default 'kg',
  qty numeric not null default 0,
  min numeric not null default 0,
  rate numeric not null default 0,
  gst_percent numeric not null default 0,
  category text,
  created_at timestamptz default now()
);

-- One row per bill. `items` holds the multi-product cart as JSON, e.g.
-- [{ "name": "SS Pipe", "size": "2 inch", "qty": 40, "unit": "kg", "rate": 245, "amount": 9800 }]
create table if not exists billings (
  id uuid primary key default gen_random_uuid(),
  bill_no text not null,
  customer text not null,
  staff text not null,
  mode text not null,
  status text not null default 'Paid',
  note text,
  items jsonb not null default '[]',
  discount numeric not null default 0,
  gst_enabled boolean not null default true,
  gst_percent numeric not null default 18,
  cgst_percent numeric not null default 9,
  sgst_percent numeric not null default 9,
  billed_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  invoice text not null,
  supplier text not null,
  gstin text,
  product text not null,
  size text,
  unit text not null default 'kg',
  qty numeric not null,
  rate numeric not null,
  gst_percent numeric not null default 18,
  status text not null default 'Pending',
  purchased_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  item_name text,
  qty numeric,
  unit_price numeric,
  amount numeric not null,
  note text,
  spent_at timestamptz not null default now()
);

create table if not exists drawings (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  person text not null,
  amount numeric not null,
  note text,
  moved_at timestamptz not null default now()
);

create table if not exists suppliers_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists settings (
  id int primary key default 1,
  business_name text not null default 'My Business',
  owner_name text not null default 'Owner',
  gstin text,
  invoice_prefix text not null default 'BILL-',
  default_gst_percent numeric not null default 18,
  tagline text,
  constraint single_row check (id = 1)
);

-- Row Level Security — enable and restrict to your own logged-in users.
-- Adjust the policies below once you add Supabase Auth.
alter table staff enable row level security;
alter table stock enable row level security;
alter table billings enable row level security;
alter table purchases enable row level security;
alter table expenses enable row level security;
alter table drawings enable row level security;
alter table suppliers_directory enable row level security;
alter table settings enable row level security;

-- Example permissive policy for a single-owner setup (tighten before going live):
-- create policy "allow all for authenticated" on billings for all
--   using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
