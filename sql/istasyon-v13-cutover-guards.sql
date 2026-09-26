-- İstasyON v13 — Cutover and Open-Item Guards
-- Adds transactional safety around the durable core.
-- This migration does not create any financial movement by itself.

begin;

create or replace function public.istasyon_validate_cutover(p_run_id uuid)
returns table(
  run_id uuid,
  cutover_date date,
  expected_active_count integer,
  actual_card_count bigint,
  expected_net_balance numeric,
  actual_net_balance numeric,
  balance_difference numeric,
  unresolved_count bigint,
  can_freeze boolean
)
language sql
stable
as $$
  select
    r.id,
    r.cutover_date,
    r.expected_active_count,
    count(b.id),
    r.expected_net_balance,
    coalesce(sum(b.opening_amount),0)::numeric(18,2),
    (coalesce(r.expected_net_balance,0)-coalesce(sum(b.opening_amount),0))::numeric(18,2),
    count(*) filter (
      where b.id is not null
        and b.reconciliation_status not in ('matched','approved')
    ),
    (
      count(b.id)=coalesce(r.expected_active_count,count(b.id))
      and abs(coalesce(r.expected_net_balance,0)-coalesce(sum(b.opening_amount),0)) < 0.005
      and count(*) filter (
        where b.id is not null
          and b.reconciliation_status not in ('matched','approved')
      )=0
    ) as can_freeze
  from public.istasyon_cutover_runs r
  left join public.istasyon_opening_balances b on b.cutover_run_id=r.id
  where r.id=p_run_id
  group by r.id,r.cutover_date,r.expected_active_count,r.expected_net_balance;
$$;

create or replace function public.istasyon_guard_cutover_freeze()
returns trigger
language plpgsql
as $$
declare
  v_can_freeze boolean;
begin
  if new.status='frozen' and old.status is distinct from 'frozen' then
    select can_freeze into v_can_freeze
    from public.istasyon_validate_cutover(new.id);

    if coalesce(v_can_freeze,false) is not true then
      raise exception 'ISTASYON_CUTOVER_NOT_RECONCILED';
    end if;

    if coalesce(new.approved_by,'')='' or new.approved_at is null then
      raise exception 'ISTASYON_CUTOVER_APPROVAL_REQUIRED';
    end if;

    new.frozen_at=coalesce(new.frozen_at,now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_istasyon_cutover_freeze on public.istasyon_cutover_runs;
create trigger trg_istasyon_cutover_freeze
before update of status on public.istasyon_cutover_runs
for each row execute function public.istasyon_guard_cutover_freeze();

create or replace function public.istasyon_guard_frozen_opening()
returns trigger
language plpgsql
as $
declare
  v_status text;
  v_run_id uuid;
begin
  if TG_OP='DELETE' then
    v_run_id=old.cutover_run_id;
  else
    v_run_id=new.cutover_run_id;
  end if;

  select status into v_status
  from public.istasyon_cutover_runs
  where id=v_run_id;

  if v_status='frozen' then
    raise exception 'ISTASYON_FROZEN_OPENING_IMMUTABLE';
  end if;

  if TG_OP='DELETE' then
    return old;
  end if;
  return new;
end;
$;

drop trigger if exists trg_istasyon_opening_immutable_u on public.istasyon_opening_balances;
create trigger trg_istasyon_opening_immutable_u
before update on public.istasyon_opening_balances
for each row execute function public.istasyon_guard_frozen_opening();

drop trigger if exists trg_istasyon_opening_immutable_d on public.istasyon_opening_balances;
create trigger trg_istasyon_opening_immutable_d
before delete on public.istasyon_opening_balances
for each row execute function public.istasyon_guard_frozen_opening();

create or replace function public.istasyon_apply_allocation(
  p_open_item_id uuid,
  p_settlement_source_type text,
  p_settlement_source_ref text,
  p_amount numeric,
  p_allocation_date date,
  p_approval_ref text,
  p_note text default null
)
returns table(
  allocation_id uuid,
  open_item_id uuid,
  remaining_open_amount numeric,
  item_status text
)
language plpgsql
security invoker
as $$
declare
  v_item public.istasyon_open_items%rowtype;
  v_alloc_id uuid;
  v_key text;
  v_new_open numeric(18,2);
  v_new_status text;
begin
  if coalesce(trim(p_approval_ref),'')='' then
    raise exception 'ISTASYON_ALLOCATION_APPROVAL_REQUIRED';
  end if;
  if coalesce(p_amount,0)<=0 then
    raise exception 'ISTASYON_ALLOCATION_AMOUNT_INVALID';
  end if;

  select * into v_item
  from public.istasyon_open_items
  where id=p_open_item_id
  for update;

  if not found then
    raise exception 'ISTASYON_OPEN_ITEM_NOT_FOUND';
  end if;
  if v_item.status not in ('open','partially_cleared','review') then
    raise exception 'ISTASYON_OPEN_ITEM_NOT_ALLOCATABLE';
  end if;
  if p_amount > v_item.open_amount then
    raise exception 'ISTASYON_ALLOCATION_EXCEEDS_OPEN_AMOUNT';
  end if;

  v_key=encode(digest(
    p_open_item_id::text || '|' ||
    coalesce(p_settlement_source_type,'') || '|' ||
    coalesce(p_settlement_source_ref,'') || '|' ||
    p_amount::text || '|' ||
    p_allocation_date::text || '|' ||
    p_approval_ref,
    'sha256'
  ),'hex');

  insert into public.istasyon_allocations(
    open_item_id,settlement_source_type,settlement_source_ref,
    amount,allocation_date,approval_ref,idempotency_key,note
  )
  values(
    p_open_item_id,p_settlement_source_type,p_settlement_source_ref,
    p_amount,p_allocation_date,p_approval_ref,v_key,p_note
  )
  on conflict (idempotency_key) do update
    set note=coalesce(public.istasyon_allocations.note,excluded.note)
  returning id into v_alloc_id;

  select greatest(
    v_item.original_amount - coalesce(sum(a.amount),0),
    0
  )::numeric(18,2)
  into v_new_open
  from public.istasyon_allocations a
  where a.open_item_id=p_open_item_id;

  v_new_status=case
    when v_new_open=0 then 'cleared'
    when v_new_open<v_item.original_amount then 'partially_cleared'
    else v_item.status
  end;

  update public.istasyon_open_items
  set open_amount=v_new_open,
      status=v_new_status,
      updated_at=now()
  where id=p_open_item_id;

  insert into public.istasyon_audit_events(
    event_key,event_type,entity_type,entity_ref,actor,
    source_ref,before_json,after_json,approval_ref,verification_status
  )
  values(
    'allocation:'||v_key,
    'OPEN_ITEM_ALLOCATION',
    'open_item',
    p_open_item_id::text,
    'approved_action',
    p_settlement_source_ref,
    jsonb_build_object('open_amount',v_item.open_amount,'status',v_item.status),
    jsonb_build_object('open_amount',v_new_open,'status',v_new_status,'allocation_id',v_alloc_id),
    p_approval_ref,
    'recorded'
  )
  on conflict (event_key) do nothing;

  return query select v_alloc_id,p_open_item_id,v_new_open,v_new_status;
end;
$$;

-- A bank match cannot move to "posted" unless an approval and final posting
-- reference exist. This is only a database guard; posting itself is performed
-- by a separately approved action.
create or replace function public.istasyon_guard_bank_match_posted()
returns trigger
language plpgsql
as $$
begin
  if new.status='posted' then
    if coalesce(trim(new.approval_ref),'')='' then
      raise exception 'ISTASYON_BANK_POST_APPROVAL_REQUIRED';
    end if;
    if coalesce(trim(new.final_posting_ref),'')='' then
      raise exception 'ISTASYON_BANK_POST_READBACK_REF_REQUIRED';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_istasyon_bank_post_guard on public.istasyon_bank_matches;
create trigger trg_istasyon_bank_post_guard
before insert or update of status on public.istasyon_bank_matches
for each row execute function public.istasyon_guard_bank_match_posted();

commit;
