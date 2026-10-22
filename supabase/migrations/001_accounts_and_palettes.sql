create extension if not exists pgcrypto;

create table if not exists public.palettes (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.palettes enable row level security;

create policy "Users read their palettes" on public.palettes
  for select using (auth.uid() = user_id);
create policy "Users create their palettes" on public.palettes
  for insert with check (auth.uid() = user_id);
create policy "Users update their palettes" on public.palettes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their palettes" on public.palettes
  for delete using (auth.uid() = user_id);

create index if not exists palettes_user_updated_idx on public.palettes (user_id, updated_at desc);

create table if not exists public.shared_palettes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  palette jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shared_palettes enable row level security;

create policy "Anyone reads shared palettes" on public.shared_palettes
  for select using (true);
create policy "Users publish their palettes" on public.shared_palettes
  for insert with check (auth.uid() = owner_id);
create policy "Owners delete shared palettes" on public.shared_palettes
  for delete using (auth.uid() = owner_id);
