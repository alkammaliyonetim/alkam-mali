-- İstasyON v13 — Durable ERP / Cari Core
-- Safe migration only. This file creates staging, reconciliation, open-item,
-- document-link and audit structures. It DOES NOT post financial movements.
--
-- Canonical existing private tables:
--   cari_cards
--   cari_ekstre_lines
--
-- Safety:
--   * no DELETE / TRUNCATE on existing data
--   * no automatic INSERT into cari_ekstre_lines
--   * no automatic monthly accrual generation
--   * no bank-to-ledger posting
--   * all finalization remains approval gated

begin;

create extension if not exists pgcrypto;

create table if not exists public.istasyon_cutover_runs (
  id uuid primary key default gen_random_uuid(),
  cutover_date date not null,
  source_ref text not null,
  expected_active_count integer,
  expected_net_balance numeric(18,2),
  calculated_net_balance numeric(18,2),
  difference numeric(18,2),
  status text not null default 'draft'
    check (status in ('draft','reconciled','approved','frozen','cancelled')),
  approved_by text,
  approved_at timestamptz,
  frozen_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.istasyon_opening_balances (
  id uuid primary key default gen_random_uuid(),
  cutover_run_id uuid not null references public.istasyon_cutover_runs(id) on delete cascade,
  cari_id uuid not null references public.cari_cards(id) on delete restrict,
  source_list_amount numeric(18,2) not null default 0,
  source_pdf_amount numeric(18,2),
  cutover_delta numeric(18,2) not null default 0,
  opening_amount numeric(18,2) not null default 0,
  balance_side text not null default 'zero'
    check (balance_side in ('debit','credit','zero')),
  reconciliation_status text not null default 'pending'
    check (reconciliation_status in ('pending','matched','difference','identity_review','period_review','approved')),
  source_ref text,
  evidence_ref text,
  row_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cutover_run_id,cari_id)
);

create table if not exists public.istasyon_open_items (
  id uuid primary key default gen_random_uuid(),
  cari_id uuid not null references public.cari_cards(id) on delete restrict,
  source_line_id uuid,
  source_type text not null default 'legacy_or_ledger',
  source_ref text,
  document_no text,
  item_date date not null,
  due_date date,
  side text not null check (side in ('debit','credit')),
  original_amount numeric(18,2) not null check (original_amount >= 0),
  open_amount numeric(18,2) not null check (open_amount >= 0),
  currency_code text not null default 'TRY',
  status text not null default 'open'
    check (status in ('open','partially_cleared','cleared','cancelled','review')),
  posting_key text not null unique,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_istasyon_open_items_cari_status
  on public.istasyon_open_items(cari_id,status,item_date);
create index if not exists idx_istasyon_open_items_due
  on public.istasyon_open_items(due_date) where status in ('open','partially_cleared');

create table if not exists public.istasyon_allocations (
  id uuid primary key default gen_random_uuid(),
  open_item_id uuid not null references public.istasyon_open_items(id) on delete restrict,
  settlement_source_type text not null,
  settlement_source_ref text not null,
  amount numeric(18,2) not null check (amount > 0),
  allocation_date date not null,
  approval_ref text not null,
  idempotency_key text not null unique,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_istasyon_allocations_item
  on public.istasyon_allocations(open_item_id,allocation_date);

create table if not exists public.istasyon_bank_raw (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_ref text,
  transaction_date date not null,
  transaction_time time,
  description text not null default '',
  amount_in numeric(18,2) not null default 0,
  amount_out numeric(18,2) not null default 0,
  balance_after numeric(18,2),
  source_type text not null default 'gmail_statement',
  source_ref text not null,
  source_file_ref text,
  source_hash text not null unique,
  raw_payload jsonb not null default '{}'::jsonb,
  ingest_status text not null default 'received'
    check (ingest_status in ('received','parsed','duplicate','review','matched','approved','rejected','posted')),
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_in >= 0 and amount_out >= 0),
  check (not (amount_in > 0 and amount_out > 0))
);

create index if not exists idx_istasyon_bank_raw_date
  on public.istasyon_bank_raw(transaction_date,bank_name);
create index if not exists idx_istasyon_bank_raw_status
  on public.istasyon_bank_raw(ingest_status,transaction_date);

create table if not exists public.istasyon_bank_matches (
  id uuid primary key default gen_random_uuid(),
  bank_raw_id uuid not null references public.istasyon_bank_raw(id) on delete cascade,
  cari_id uuid references public.cari_cards(id) on delete restrict,
  suggested_action text,
  confidence numeric(5,2) not null default 0 check (confidence between 0 and 100),
  match_reason text,
  status text not null default 'needs_review'
    check (status in ('needs_review','approved','rejected','posted','superseded')),
  decided_by text,
  decided_at timestamptz,
  approval_ref text,
  final_posting_ref text,
  supersedes_id uuid references public.istasyon_bank_matches(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_istasyon_bank_active_match
  on public.istasyon_bank_matches(bank_raw_id)
  where status in ('needs_review','approved','posted');

create table if not exists public.istasyon_documents (
  id uuid primary key default gen_random_uuid(),
  document_key text not null unique,
  document_type text not null,
  document_date date,
  party_name text,
  amount numeric(18,2),
  drive_file_id text,
  drive_path text,
  sha256 text,
  source_ref text,
  status text not null default 'archived'
    check (status in ('received','archived','matched','review','superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.istasyon_document_links (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.istasyon_documents(id) on delete cascade,
  target_type text not null,
  target_ref text not null,
  relation_type text not null default 'evidence',
  created_at timestamptz not null default now(),
  unique(document_id,target_type,target_ref,relation_type)
);

create table if not exists public.istasyon_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  entity_type text,
  entity_ref text,
  actor text not null default 'system',
  source_ref text,
  before_json jsonb,
  after_json jsonb,
  approval_ref text,
  verification_status text not null default 'recorded',
  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_istasyon_audit_entity
  on public.istasyon_audit_events(entity_type,entity_ref,occurred_at desc);

-- Read models ---------------------------------------------------------------

create or replace view public.v_istasyon_opening_reconciliation as
select
  r.id as cutover_run_id,
  r.cutover_date,
  r.status as cutover_status,
  r.expected_active_count,
  r.expected_net_balance,
  count(b.id) as card_count,
  sum(b.opening_amount)::numeric(18,2) as calculated_opening_balance,
  coalesce(r.expected_net_balance,0) - coalesce(sum(b.opening_amount),0) as balance_difference,
  count(*) filter (where b.reconciliation_status <> 'matched' and b.reconciliation_status <> 'approved') as unresolved_count
from public.istasyon_cutover_runs r
left join public.istasyon_opening_balances b on b.cutover_run_id=r.id
group by r.id,r.cutover_date,r.status,r.expected_active_count,r.expected_net_balance;

create or replace view public.v_istasyon_open_items as
select
  i.id,
  i.cari_id,
  c.cari_name,
  c.cari_code,
  i.item_date,
  i.due_date,
  i.side,
  i.original_amount,
  i.open_amount,
  i.currency_code,
  i.status,
  i.document_no,
  i.source_type,
  i.source_ref,
  case
    when i.status in ('open','partially_cleared') and i.due_date is not null and i.due_date < current_date then 'overdue'
    when i.status in ('open','partially_cleared') and i.due_date = current_date then 'due_today'
    when i.status in ('open','partially_cleared') then 'open'
    else i.status
  end as aging_status
from public.istasyon_open_items i
join public.cari_cards c on c.id=i.cari_id;

create or replace view public.v_istasyon_bank_review as
select
  b.id as bank_raw_id,
  b.bank_name,
  b.account_ref,
  b.transaction_date,
  b.transaction_time,
  b.description,
  b.amount_in,
  b.amount_out,
  b.balance_after,
  b.ingest_status,
  m.id as match_id,
  m.cari_id,
  c.cari_name,
  m.suggested_action,
  m.confidence,
  m.match_reason,
  m.status as match_status,
  m.approval_ref,
  b.source_ref,
  b.source_file_ref
from public.istasyon_bank_raw b
left join public.istasyon_bank_matches m
  on m.bank_raw_id=b.id and m.status <> 'superseded'
left join public.cari_cards c on c.id=m.cari_id
order by b.transaction_date desc,b.transaction_time desc nulls last,b.received_at desc;

create or replace view public.v_istasyon_cari_control as
with ledger as (
  select
    c.id as cari_id,
    c.cari_name,
    c.cari_code,
    coalesce(sum(coalesce(l.debit,0)-coalesce(l.credit,0)),0)::numeric(18,2) as ledger_balance,
    count(l.id) as ledger_rows,
    max(l.line_date) as last_movement_date
  from public.cari_cards c
  left join public.cari_ekstre_lines l on l.cari_id=c.id
  where coalesce(c.is_active,true)=true
  group by c.id,c.cari_name,c.cari_code
),
open_items as (
  select
    cari_id,
    coalesce(sum(case when side='debit' then open_amount else -open_amount end)
      filter (where status in ('open','partially_cleared','review')),0)::numeric(18,2) as open_item_balance,
    count(*) filter (where status in ('open','partially_cleared','review')) as open_item_count
  from public.istasyon_open_items
  group by cari_id
)
select
  l.cari_id,
  l.cari_name,
  l.cari_code,
  l.ledger_balance,
  l.ledger_rows,
  l.last_movement_date,
  coalesce(o.open_item_balance,0) as open_item_balance,
  coalesce(o.open_item_count,0) as open_item_count,
  case
    when o.cari_id is null then 'open_items_not_built'
    when l.ledger_balance = o.open_item_balance then 'matched'
    else 'difference'
  end as reconciliation_status
from ledger l
left join open_items o on o.cari_id=l.cari_id
order by l.cari_name;

-- Guard views. A financial row is never considered postable without an
-- explicit approval reference.
create or replace view public.v_istasyon_bank_ready_for_posting as
select *
from public.v_istasyon_bank_review
where match_status='approved'
  and coalesce(approval_ref,'') <> '';

commit;
