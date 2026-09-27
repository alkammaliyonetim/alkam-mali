-- İstasyON v13 — Operational Services
-- Safe operational layer: bank/document ingestion, match proposals and read models.
-- This migration NEVER posts directly to cari_ekstre_lines and NEVER clears
-- an open item without an explicit approval reference.

begin;

create extension if not exists pgcrypto;

create table if not exists public.istasyon_posting_receipts (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_ref text not null,
  target_type text not null,
  target_ref text not null,
  approval_ref text not null,
  readback_ref text not null,
  payload_hash text,
  posted_by text not null,
  posted_at timestamptz not null default now(),
  unique(source_type,source_ref,target_type,target_ref)
);

create or replace function public.istasyon_ingest_bank_raw(
  p_bank_name text,
  p_account_ref text,
  p_transaction_date date,
  p_transaction_time time,
  p_description text,
  p_amount_in numeric,
  p_amount_out numeric,
  p_balance_after numeric,
  p_source_type text,
  p_source_ref text,
  p_source_file_ref text default null,
  p_raw_payload jsonb default '{}'::jsonb
)
returns table(bank_raw_id uuid, duplicate boolean)
language plpgsql
security invoker
as $$
declare
  v_hash text;
  v_id uuid;
  v_existing uuid;
begin
  if p_transaction_date is null then raise exception 'ISTASYON_BANK_DATE_REQUIRED'; end if;
  if coalesce(trim(p_bank_name),'')='' then raise exception 'ISTASYON_BANK_NAME_REQUIRED'; end if;
  if coalesce(trim(p_source_ref),'')='' then raise exception 'ISTASYON_BANK_SOURCE_REQUIRED'; end if;
  if coalesce(p_amount_in,0)<0 or coalesce(p_amount_out,0)<0 then raise exception 'ISTASYON_BANK_AMOUNT_INVALID'; end if;
  if coalesce(p_amount_in,0)>0 and coalesce(p_amount_out,0)>0 then raise exception 'ISTASYON_BANK_DIRECTION_AMBIGUOUS'; end if;

  v_hash=encode(digest(
    upper(trim(coalesce(p_bank_name,'')))||'|'||
    coalesce(trim(p_account_ref),'')||'|'||
    p_transaction_date::text||'|'||
    coalesce(p_transaction_time::text,'')||'|'||
    coalesce(p_amount_in,0)::text||'|'||
    coalesce(p_amount_out,0)::text||'|'||
    coalesce(p_balance_after::text,'')||'|'||
    upper(regexp_replace(trim(coalesce(p_description,'')),'\s+',' ','g'))||'|'||
    trim(p_source_ref),
    'sha256'
  ),'hex');

  select id into v_existing
  from public.istasyon_bank_raw
  where source_hash=v_hash
  limit 1;

  if v_existing is not null then
    return query select v_existing,true;
    return;
  end if;

  insert into public.istasyon_bank_raw(
    bank_name,account_ref,transaction_date,transaction_time,description,
    amount_in,amount_out,balance_after,source_type,source_ref,source_file_ref,
    source_hash,raw_payload,ingest_status
  )
  values(
    trim(p_bank_name),nullif(trim(coalesce(p_account_ref,'')),''),
    p_transaction_date,p_transaction_time,coalesce(p_description,''),
    coalesce(p_amount_in,0),coalesce(p_amount_out,0),p_balance_after,
    coalesce(nullif(trim(p_source_type),''),'gmail_statement'),trim(p_source_ref),
    nullif(trim(coalesce(p_source_file_ref,'')),''),
    v_hash,coalesce(p_raw_payload,'{}'::jsonb),'received'
  )
  returning id into v_id;

  insert into public.istasyon_audit_events(
    event_key,event_type,entity_type,entity_ref,actor,source_ref,after_json,verification_status
  )
  values(
    'bank-ingest:'||v_hash,'BANK_RAW_INGEST','bank_raw',v_id::text,'ingest',
    p_source_ref,
    jsonb_build_object('bank_name',p_bank_name,'date',p_transaction_date,'amount_in',coalesce(p_amount_in,0),'amount_out',coalesce(p_amount_out,0)),
    'recorded'
  )
  on conflict(event_key) do nothing;

  return query select v_id,false;
end;
$$;

create or replace function public.istasyon_propose_bank_match(
  p_bank_raw_id uuid,
  p_cari_id uuid,
  p_suggested_action text,
  p_confidence numeric,
  p_match_reason text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if not exists(select 1 from public.istasyon_bank_raw where id=p_bank_raw_id) then
    raise exception 'ISTASYON_BANK_RAW_NOT_FOUND';
  end if;
  if p_cari_id is not null and not exists(select 1 from public.cari_cards where id=p_cari_id) then
    raise exception 'ISTASYON_CARI_NOT_FOUND';
  end if;
  if coalesce(p_confidence,0)<0 or coalesce(p_confidence,0)>100 then
    raise exception 'ISTASYON_MATCH_CONFIDENCE_INVALID';
  end if;

  update public.istasyon_bank_matches
  set status='superseded',updated_at=now()
  where bank_raw_id=p_bank_raw_id and status='needs_review';

  insert into public.istasyon_bank_matches(
    bank_raw_id,cari_id,suggested_action,confidence,match_reason,status
  )
  values(
    p_bank_raw_id,p_cari_id,nullif(trim(coalesce(p_suggested_action,'')),''),
    coalesce(p_confidence,0),nullif(trim(coalesce(p_match_reason,'')),''),'needs_review'
  )
  returning id into v_id;

  update public.istasyon_bank_raw
  set ingest_status='review',updated_at=now()
  where id=p_bank_raw_id and ingest_status in ('received','parsed','matched');

  return v_id;
end;
$$;

create or replace function public.istasyon_approve_bank_match(
  p_match_id uuid,
  p_approval_ref text,
  p_decided_by text
)
returns table(match_id uuid, status text)
language plpgsql
security invoker
as $$
declare
  v_match public.istasyon_bank_matches%rowtype;
begin
  if coalesce(trim(p_approval_ref),'')='' then raise exception 'ISTASYON_BANK_MATCH_APPROVAL_REQUIRED'; end if;
  if coalesce(trim(p_decided_by),'')='' then raise exception 'ISTASYON_BANK_MATCH_DECIDER_REQUIRED'; end if;

  select * into v_match
  from public.istasyon_bank_matches
  where id=p_match_id
  for update;

  if not found then raise exception 'ISTASYON_BANK_MATCH_NOT_FOUND'; end if;
  if v_match.status='posted' then
    return query select v_match.id,v_match.status;
    return;
  end if;
  if v_match.status not in ('needs_review','approved') then
    raise exception 'ISTASYON_BANK_MATCH_NOT_APPROVABLE';
  end if;

  update public.istasyon_bank_matches
  set status='approved',approval_ref=trim(p_approval_ref),decided_by=trim(p_decided_by),
      decided_at=coalesce(decided_at,now()),updated_at=now()
  where id=p_match_id;

  update public.istasyon_bank_raw
  set ingest_status='approved',updated_at=now()
  where id=v_match.bank_raw_id;

  insert into public.istasyon_audit_events(
    event_key,event_type,entity_type,entity_ref,actor,source_ref,
    before_json,after_json,approval_ref,verification_status
  )
  values(
    'bank-approve:'||p_match_id::text||':'||trim(p_approval_ref),
    'BANK_MATCH_APPROVED','bank_match',p_match_id::text,trim(p_decided_by),
    v_match.bank_raw_id::text,
    jsonb_build_object('status',v_match.status,'cari_id',v_match.cari_id,'confidence',v_match.confidence),
    jsonb_build_object('status','approved','cari_id',v_match.cari_id,'confidence',v_match.confidence),
    trim(p_approval_ref),'recorded'
  )
  on conflict(event_key) do nothing;

  return query select p_match_id,'approved'::text;
end;
$$;

create or replace function public.istasyon_register_document(
  p_document_key text,
  p_document_type text,
  p_document_date date,
  p_party_name text,
  p_amount numeric,
  p_drive_file_id text,
  p_drive_path text,
  p_sha256 text,
  p_source_ref text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if coalesce(trim(p_document_key),'')='' then raise exception 'ISTASYON_DOCUMENT_KEY_REQUIRED'; end if;
  if coalesce(trim(p_document_type),'')='' then raise exception 'ISTASYON_DOCUMENT_TYPE_REQUIRED'; end if;
  if coalesce(trim(p_drive_file_id),'')='' and coalesce(trim(p_drive_path),'')='' then
    raise exception 'ISTASYON_DOCUMENT_ARCHIVE_REF_REQUIRED';
  end if;

  insert into public.istasyon_documents(
    document_key,document_type,document_date,party_name,amount,
    drive_file_id,drive_path,sha256,source_ref,status
  )
  values(
    trim(p_document_key),trim(p_document_type),p_document_date,
    nullif(trim(coalesce(p_party_name,'')),''),p_amount,
    nullif(trim(coalesce(p_drive_file_id,'')),''),
    nullif(trim(coalesce(p_drive_path,'')),''),
    nullif(trim(coalesce(p_sha256,'')),''),
    nullif(trim(coalesce(p_source_ref,'')),''),
    'archived'
  )
  on conflict(document_key) do update
  set document_type=excluded.document_type,
      document_date=coalesce(excluded.document_date,public.istasyon_documents.document_date),
      party_name=coalesce(excluded.party_name,public.istasyon_documents.party_name),
      amount=coalesce(excluded.amount,public.istasyon_documents.amount),
      drive_file_id=coalesce(excluded.drive_file_id,public.istasyon_documents.drive_file_id),
      drive_path=coalesce(excluded.drive_path,public.istasyon_documents.drive_path),
      sha256=coalesce(excluded.sha256,public.istasyon_documents.sha256),
      source_ref=coalesce(excluded.source_ref,public.istasyon_documents.source_ref),
      updated_at=now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.istasyon_link_document(
  p_document_id uuid,
  p_target_type text,
  p_target_ref text,
  p_relation_type text default 'evidence'
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_id uuid;
begin
  if not exists(select 1 from public.istasyon_documents where id=p_document_id) then
    raise exception 'ISTASYON_DOCUMENT_NOT_FOUND';
  end if;
  if coalesce(trim(p_target_type),'')='' or coalesce(trim(p_target_ref),'')='' then
    raise exception 'ISTASYON_DOCUMENT_TARGET_REQUIRED';
  end if;

  insert into public.istasyon_document_links(document_id,target_type,target_ref,relation_type)
  values(p_document_id,trim(p_target_type),trim(p_target_ref),coalesce(nullif(trim(p_relation_type),''),'evidence'))
  on conflict(document_id,target_type,target_ref,relation_type) do update
    set target_ref=excluded.target_ref
  returning id into v_id;

  update public.istasyon_documents set status='matched',updated_at=now() where id=p_document_id;
  return v_id;
end;
$$;

create or replace view public.v_istasyon_receivables_aging as
select
  i.cari_id,
  c.cari_name,
  c.cari_code,
  count(*) filter(where i.status in ('open','partially_cleared','review')) as open_item_count,
  coalesce(sum(case when i.side='debit' and i.status in ('open','partially_cleared','review') then i.open_amount else 0 end),0)::numeric(18,2) as receivable,
  coalesce(sum(case when i.side='credit' and i.status in ('open','partially_cleared','review') then i.open_amount else 0 end),0)::numeric(18,2) as customer_credit,
  coalesce(sum(case when i.side='debit' and i.status in ('open','partially_cleared','review') and i.due_date<current_date then i.open_amount else 0 end),0)::numeric(18,2) as overdue,
  coalesce(sum(case when i.side='debit' and i.status in ('open','partially_cleared','review') and i.due_date between current_date and current_date+7 then i.open_amount else 0 end),0)::numeric(18,2) as due_7d,
  min(i.due_date) filter(where i.side='debit' and i.status in ('open','partially_cleared','review') and i.open_amount>0) as oldest_due_date
from public.cari_cards c
left join public.istasyon_open_items i on i.cari_id=c.id
where coalesce(c.is_active,true)=true
group by i.cari_id,c.id,c.cari_name,c.cari_code
order by overdue desc,receivable desc,c.cari_name;

create or replace view public.v_istasyon_document_search as
select
  d.id,d.document_key,d.document_type,d.document_date,d.party_name,d.amount,
  d.drive_file_id,d.drive_path,d.sha256,d.source_ref,d.status,
  l.target_type,l.target_ref,l.relation_type,d.created_at,d.updated_at
from public.istasyon_documents d
left join public.istasyon_document_links l on l.document_id=d.id
order by d.document_date desc nulls last,d.created_at desc;

create or replace view public.v_istasyon_control_center as
select
  (select count(*) from public.cari_cards where coalesce(is_active,true)=true) as active_cari,
  (select count(*) from public.istasyon_open_items where status in ('open','partially_cleared','review')) as open_item_count,
  (select coalesce(sum(case when side='debit' then open_amount else -open_amount end),0) from public.istasyon_open_items where status in ('open','partially_cleared','review'))::numeric(18,2) as open_item_net,
  (select count(*) from public.istasyon_bank_raw where ingest_status in ('received','parsed','review','matched')) as bank_waiting,
  (select count(*) from public.istasyon_bank_matches where status='needs_review') as bank_match_waiting,
  (select count(*) from public.istasyon_bank_matches where status='approved') as bank_approved_waiting_posting,
  (select count(*) from public.istasyon_documents where status in ('received','archived','review')) as documents_waiting_match,
  (select max(transaction_date) from public.istasyon_bank_raw) as last_bank_date,
  (select max(occurred_at) from public.istasyon_audit_events) as last_audit_at;

commit;
