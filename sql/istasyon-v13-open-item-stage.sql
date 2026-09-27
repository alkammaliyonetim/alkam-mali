-- İstasyON v13 — Historical Open-Item Candidate Stage
-- Non-posting staging only. This migration never writes cari_ekstre_lines,
-- istasyon_open_items, or another final financial ledger table.

begin;

create extension if not exists pgcrypto;

create table if not exists public.istasyon_open_item_candidate_stage (
  candidate_key text primary key,
  as_of_date date not null,
  cari_source_key text not null,
  cari_name text not null,
  source_row_key text not null,
  source_row_index integer,
  item_date date not null,
  document_no text,
  description text,
  side text not null check (side in ('debit','credit')),
  original_amount numeric(18,2) not null check (original_amount >= 0),
  open_amount numeric(18,2) not null check (open_amount >= 0),
  source_type text not null default 'legacy_bizmu_json',
  source_ref text not null,
  row_hash text not null unique,
  reconciliation_status text not null default 'candidate'
    check (reconciliation_status in ('candidate','matched','difference','review','superseded')),
  raw_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);

create index if not exists idx_istasyon_open_item_candidate_cari
  on public.istasyon_open_item_candidate_stage(as_of_date,cari_source_key,item_date);
create index if not exists idx_istasyon_open_item_candidate_status
  on public.istasyon_open_item_candidate_stage(reconciliation_status,as_of_date);

create table if not exists public.istasyon_open_item_allocation_stage (
  allocation_key text primary key,
  as_of_date date not null,
  cari_source_key text not null,
  open_source_row_key text not null,
  settlement_source_row_key text not null,
  allocation_date date not null,
  amount numeric(18,2) not null check (amount > 0),
  method text not null default 'fifo_reconstruction',
  source_ref text not null,
  row_hash text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_istasyon_open_item_allocation_cari
  on public.istasyon_open_item_allocation_stage(as_of_date,cari_source_key,allocation_date);

create or replace view public.v_istasyon_open_item_candidate_summary as
select
  as_of_date,
  cari_source_key,
  cari_name,
  count(*) filter (where open_amount > 0) as open_item_count,
  sum(case when side='debit' then open_amount else -open_amount end)::numeric(18,2) as reconstructed_balance,
  sum(case when side='debit' then open_amount else 0 end)::numeric(18,2) as open_debit,
  sum(case when side='credit' then open_amount else 0 end)::numeric(18,2) as open_credit,
  min(item_date) filter (where open_amount > 0) as oldest_open_date,
  max(item_date) filter (where open_amount > 0) as newest_open_date
from public.istasyon_open_item_candidate_stage
where reconciliation_status <> 'superseded'
group by as_of_date,cari_source_key,cari_name;

create or replace view public.v_istasyon_open_item_stage_control as
select
  s.as_of_date,
  count(*) as cari_count,
  sum(s.reconstructed_balance)::numeric(18,2) as reconstructed_net,
  sum(s.open_debit)::numeric(18,2) as open_debit,
  sum(s.open_credit)::numeric(18,2) as open_credit,
  sum(s.open_item_count) as open_item_count
from public.v_istasyon_open_item_candidate_summary s
group by s.as_of_date;

commit;
