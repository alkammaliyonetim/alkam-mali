-- İstasyON v13 — RLS and privilege boundary
-- Apply AFTER ALKAM_SUPABASE_RLS_V10.sql and the v13 core/operations migrations.
-- Goal: no anonymous access, authenticated read, controlled finance writes.

begin;

do $$
begin
  if to_regprocedure('public.can_write_finance()') is null then
    raise exception 'ISTASYON_RLS_BASE_ROLE_FUNCTIONS_REQUIRED';
  end if;
end $$;

alter table public.istasyon_cutover_runs enable row level security;
alter table public.istasyon_opening_balances enable row level security;
alter table public.istasyon_open_items enable row level security;
alter table public.istasyon_allocations enable row level security;
alter table public.istasyon_bank_raw enable row level security;
alter table public.istasyon_bank_matches enable row level security;
alter table public.istasyon_documents enable row level security;
alter table public.istasyon_document_links enable row level security;
alter table public.istasyon_audit_events enable row level security;
alter table public.istasyon_opening_source_stage enable row level security;
alter table public.istasyon_open_item_candidate_stage enable row level security;
alter table public.istasyon_open_item_allocation_stage enable row level security;
alter table public.istasyon_posting_receipts enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'istasyon_cutover_runs','istasyon_opening_balances','istasyon_open_items',
    'istasyon_allocations','istasyon_bank_raw','istasyon_bank_matches',
    'istasyon_documents','istasyon_document_links','istasyon_audit_events',
    'istasyon_opening_source_stage','istasyon_open_item_candidate_stage',
    'istasyon_open_item_allocation_stage','istasyon_posting_receipts'
  ]
  loop
    execute format('drop policy if exists %I on public.%I','is13_read_authenticated_'||t,t);
    execute format('create policy %I on public.%I for select to authenticated using (true)','is13_read_authenticated_'||t,t);
  end loop;
end $$;

-- Staging/server ingestion: service role only.
revoke all on public.istasyon_bank_raw from anon;
revoke all on public.istasyon_bank_matches from anon;
revoke all on public.istasyon_documents from anon;
revoke all on public.istasyon_document_links from anon;
revoke all on public.istasyon_posting_receipts from anon;

-- Direct table writes for authenticated users are intentionally not granted here.
-- Approved mutations are expected to use guarded RPCs and can_write_finance().
revoke insert,update,delete on public.istasyon_open_items from authenticated;
revoke insert,update,delete on public.istasyon_allocations from authenticated;
revoke insert,update,delete on public.istasyon_bank_raw from authenticated;
revoke insert,update,delete on public.istasyon_bank_matches from authenticated;
revoke insert,update,delete on public.istasyon_posting_receipts from authenticated;

revoke all on function public.istasyon_ingest_bank_raw(text,text,date,time,text,numeric,numeric,numeric,text,text,text,jsonb) from public,anon;
revoke all on function public.istasyon_propose_bank_match(uuid,uuid,text,numeric,text) from public,anon;
revoke all on function public.istasyon_approve_bank_match(uuid,text,text) from public,anon;
revoke all on function public.istasyon_register_document(text,text,date,text,numeric,text,text,text,text) from public,anon;
revoke all on function public.istasyon_link_document(uuid,text,text,text) from public,anon;
revoke all on function public.istasyon_apply_allocation(uuid,text,text,numeric,date,text,text) from public,anon;

grant execute on function public.istasyon_ingest_bank_raw(text,text,date,time,text,numeric,numeric,numeric,text,text,text,jsonb) to service_role;
grant execute on function public.istasyon_propose_bank_match(uuid,uuid,text,numeric,text) to service_role;
grant execute on function public.istasyon_register_document(text,text,date,text,numeric,text,text,text,text) to service_role;
grant execute on function public.istasyon_link_document(uuid,text,text,text) to service_role;

grant execute on function public.istasyon_approve_bank_match(uuid,text,text) to authenticated,service_role;
grant execute on function public.istasyon_apply_allocation(uuid,text,text,numeric,date,text,text) to authenticated,service_role;

commit;
