-- İstasyON v13 — Canonical Opening Source Stage
-- Stores the source-of-truth 73-card package before a cutover date is chosen.
-- Staging only: does not change cari_ekstre_lines or create financial postings.

begin;

create table if not exists public.istasyon_opening_source_stage (
  source_card_key text primary key,
  party_name text not null,
  source_list_amount numeric(18,2) not null,
  source_pdf_amount numeric(18,2),
  pdf_list_difference numeric(18,2) not null default 0,
  balance_side_source text,
  opening_candidate numeric(18,2) not null,
  identity_control text,
  period_risk text,
  legacy_json_balance numeric(18,2),
  legacy_json_difference numeric(18,2),
  pdf_source text,
  list_location text,
  source_reconciliation_status text,
  note text,
  source_package text not null,
  row_hash text not null unique,
  imported_at timestamptz not null default now()
);

create index if not exists idx_istasyon_opening_source_party
  on public.istasyon_opening_source_stage(upper(trim(party_name)));

create or replace view public.v_istasyon_opening_source_match as
with candidates as (
  select
    s.*,
    c.id as cari_id,
    c.cari_name,
    count(c.id) over (partition by s.source_card_key) as exact_match_count
  from public.istasyon_opening_source_stage s
  left join public.cari_cards c
    on upper(trim(c.cari_name)) = upper(trim(s.party_name))
   and coalesce(c.is_active,true)=true
)
select
  source_card_key,
  party_name,
  source_list_amount,
  source_pdf_amount,
  pdf_list_difference,
  balance_side_source,
  opening_candidate,
  identity_control,
  period_risk,
  legacy_json_balance,
  legacy_json_difference,
  pdf_source,
  list_location,
  source_reconciliation_status,
  note,
  source_package,
  row_hash,
  cari_id,
  cari_name,
  exact_match_count,
  case
    when exact_match_count=0 then 'missing_cari'
    when exact_match_count>1 then 'ambiguous_cari'
    when coalesce(identity_control,'')='AD_DONEM_ONAYI_GEREKIR' then 'identity_review'
    when coalesce(period_risk,'')<>'' then 'period_review'
    when coalesce(pdf_list_difference,0)<>0 then 'source_difference'
    else 'ready'
  end as match_status
from candidates;

create or replace function public.istasyon_prepare_cutover(
  p_cutover_date date,
  p_source_ref text,
  p_created_by text default 'system'
)
returns table(
  run_id uuid,
  inserted_cards integer,
  skipped_cards integer,
  expected_cards integer,
  expected_net numeric,
  inserted_net numeric,
  unresolved_cards integer
)
language plpgsql
security invoker
as $$
declare
  v_run uuid;
  v_inserted integer;
  v_inserted_net numeric(18,2);
  v_unresolved integer;
begin
  if p_cutover_date is null then
    raise exception 'ISTASYON_CUTOVER_DATE_REQUIRED';
  end if;
  if coalesce(trim(p_source_ref),'')='' then
    raise exception 'ISTASYON_CUTOVER_SOURCE_REQUIRED';
  end if;

  insert into public.istasyon_cutover_runs(
    cutover_date,source_ref,expected_active_count,expected_net_balance,
    calculated_net_balance,difference,status,notes
  )
  values(
    p_cutover_date,p_source_ref,73,3741583.88,
    0,3741583.88,'draft',
    'Prepared from canonical 73-card source package; no ledger posting performed. Created by '||coalesce(p_created_by,'system')
  )
  returning id into v_run;

  insert into public.istasyon_opening_balances(
    cutover_run_id,cari_id,source_list_amount,source_pdf_amount,
    cutover_delta,opening_amount,balance_side,reconciliation_status,
    source_ref,evidence_ref,row_hash
  )
  select
    v_run,
    m.cari_id,
    m.source_list_amount,
    m.source_pdf_amount,
    0,
    m.opening_candidate,
    case
      when m.opening_candidate>0 then 'debit'
      when m.opening_candidate<0 then 'credit'
      else 'zero'
    end,
    case
      when m.match_status='ready' then 'matched'
      when m.match_status='identity_review' then 'identity_review'
      when m.match_status='period_review' then 'period_review'
      else 'difference'
    end,
    m.list_location,
    concat_ws('|',m.pdf_source,m.source_card_key),
    encode(digest(v_run::text||'|'||m.source_card_key||'|'||m.opening_candidate::text,'sha256'),'hex')
  from public.v_istasyon_opening_source_match m
  where m.exact_match_count=1;

  select count(*),coalesce(sum(opening_amount),0)
  into v_inserted,v_inserted_net
  from public.istasyon_opening_balances
  where cutover_run_id=v_run;

  select count(*)
  into v_unresolved
  from public.v_istasyon_opening_source_match
  where match_status<>'ready';

  update public.istasyon_cutover_runs
  set calculated_net_balance=v_inserted_net,
      difference=(3741583.88-v_inserted_net),
      status=case
        when v_inserted=73 and abs(3741583.88-v_inserted_net)<0.005 and v_unresolved=0
          then 'reconciled'
        else 'draft'
      end,
      updated_at=now()
  where id=v_run;

  return query
  select
    v_run,
    v_inserted,
    73-v_inserted,
    73,
    3741583.88::numeric,
    v_inserted_net,
    v_unresolved;
end;
$$;

create or replace view public.v_istasyon_opening_source_summary as
select
  count(*) as source_card_count,
  sum(source_list_amount)::numeric(18,2) as source_list_total,
  sum(source_pdf_amount)::numeric(18,2) as source_pdf_total,
  count(*) filter (where source_list_amount>0) as debit_cards,
  count(*) filter (where source_list_amount<0) as credit_cards,
  count(*) filter (where source_list_amount=0) as zero_cards,
  count(*) filter (where coalesce(identity_control,'')='AD_DONEM_ONAYI_GEREKIR') as identity_review_cards,
  count(*) filter (where coalesce(period_risk,'')<>'') as period_review_cards
from public.istasyon_opening_source_stage;

commit;
