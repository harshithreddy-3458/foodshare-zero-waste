-- FoodShare database schema
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.food_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 90),
  category text not null check (category in ('Meals','Produce','Bakery','Dairy','Pantry')),
  quantity text not null,
  location text not null,
  expires_at timestamptz not null,
  description text not null default '',
  donor_name text not null,
  status text not null default 'available' check (status in ('available','claimed')),
  created_at timestamptz not null default now()
);

create index if not exists food_listings_status_idx on public.food_listings(status);
create index if not exists food_listings_category_idx on public.food_listings(category);
create index if not exists food_listings_created_at_idx on public.food_listings(created_at desc);

-- The application uses the Supabase service-role key on the server only.
-- Do not expose the service-role key in browser code.
-- Before enabling direct client access, design and test proper RLS policies.
alter table public.food_listings enable row level security;
