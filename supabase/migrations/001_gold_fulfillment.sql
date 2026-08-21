create extension if not exists pgcrypto;

create table if not exists public.mailing_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  workflow_id text not null,
  status text not null default 'pending',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  mailing_method text not null check (mailing_method in ('standard','certified','registered')),
  draft_content text not null,
  recipient jsonb not null,
  total_cents integer not null check (total_cents > 0),
  provider_order_id text,
  tracking_number text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mailing_intents enable row level security;
drop policy if exists mailing_intents_select_own on public.mailing_intents;
create policy mailing_intents_select_own on public.mailing_intents for select using (auth.uid() = user_id);
drop policy if exists mailing_intents_insert_own on public.mailing_intents;
create policy mailing_intents_insert_own on public.mailing_intents for insert with check (auth.uid() = user_id);
drop policy if exists mailing_intents_update_own on public.mailing_intents;
create policy mailing_intents_update_own on public.mailing_intents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists mailing_intents_user_idx on public.mailing_intents(user_id, updated_at desc);
create index if not exists mailing_intents_provider_idx on public.mailing_intents(provider_order_id);

create or replace function public.govreply_mailing_intent_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mailing_intents_updated_at on public.mailing_intents;
create trigger mailing_intents_updated_at before update on public.mailing_intents for each row execute function public.govreply_mailing_intent_updated_at();
