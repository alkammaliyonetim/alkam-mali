import fs from 'node:fs/promises';

const seedPath = new URL('../data/istasyon-opening-seed-20260926.json', import.meta.url);
const outPath = new URL('../data/istasyon-opening-stage.generated.sql', import.meta.url);
const seed = JSON.parse(await fs.readFile(seedPath,'utf8'));

const cutoverDate = String(process.env.ISTASYON_CUTOVER_DATE || '').trim();
if (!/^20\d{2}-\d{2}-\d{2}$/.test(cutoverDate)) {
  console.error('ISTASYON_CUTOVER_DATE gerekli (YYYY-MM-DD). Bu araç canlı DB yazmaz; yalnız staging SQL üretir.');
  process.exit(2);
}

const q = (s) => "'" + String(s ?? '').replaceAll("'","''") + "'";
const rowsSql = seed.rows.map((r) => [
  q(r.source_card_id),
  q(r.name),
  Number(r.opening_balance).toFixed(2),
  Number(r.pdf_balance ?? r.opening_balance).toFixed(2),
  q(r.balance_side),
  q(r.identity_check || ''),
  q(r.period_risk || ''),
  q(r.pdf_source || '')
].join(',')).map((x)=>'  ('+x+')').join(',\n');

const sql = `-- GENERATED / STAGING ONLY
-- İstasyON v13 opening seed loader
-- Cutover date: ${cutoverDate}
-- This SQL writes ONLY istasyon_cutover_runs + istasyon_opening_balances.
-- It DOES NOT write cari_ekstre_lines and DOES NOT finalize/freeze a cutover.

begin;

create temp table tmp_istasyon_opening_seed (
  source_card_id text,
  cari_name text,
  opening_balance numeric(18,2),
  pdf_balance numeric(18,2),
  balance_side text,
  identity_check text,
  period_risk text,
  pdf_source text
) on commit drop;

insert into tmp_istasyon_opening_seed values
${rowsSql};

do $$
declare
  v_count integer;
  v_net numeric(18,2);
begin
  select count(*),coalesce(sum(opening_balance),0)
  into v_count,v_net
  from tmp_istasyon_opening_seed;

  if v_count <> ${Number(seed.expected_active_count)} then
    raise exception 'opening seed count mismatch: %',v_count;
  end if;
  if round(v_net,2) <> ${Number(seed.expected_net_balance).toFixed(2)} then
    raise exception 'opening seed net mismatch: %',v_net;
  end if;
end $$;

with created as (
  insert into public.istasyon_cutover_runs(
    cutover_date,source_ref,expected_active_count,expected_net_balance,
    calculated_net_balance,difference,status,notes
  )
  values(
    date '${cutoverDate}',
    ${q(seed.source)},
    ${Number(seed.expected_active_count)},
    ${Number(seed.expected_net_balance).toFixed(2)},
    ${Number(seed.expected_net_balance).toFixed(2)},
    0,
    'draft',
    'Generated from reconciled 73-cari seed. User approval required before approved/frozen.'
  )
  returning id
),
matched as (
  select
    x.*,
    c.id as cari_id,
    c.cari_name as matched_name
  from tmp_istasyon_opening_seed x
  left join public.cari_cards c
    on upper(regexp_replace(trim(c.cari_name),'\\s+',' ','g'))
     = upper(regexp_replace(trim(x.cari_name),'\\s+',' ','g'))
),
guard as (
  select
    count(*) filter (where cari_id is null) as missing_count,
    count(*) filter (where cari_id is not null) as matched_count
  from matched
),
ins as (
  insert into public.istasyon_opening_balances(
    cutover_run_id,cari_id,source_list_amount,source_pdf_amount,
    cutover_delta,opening_amount,balance_side,reconciliation_status,
    source_ref,evidence_ref,row_hash
  )
  select
    created.id,
    m.cari_id,
    m.opening_balance,
    m.pdf_balance,
    0,
    m.opening_balance,
    case when m.opening_balance>0 then 'debit' when m.opening_balance<0 then 'credit' else 'zero' end,
    case
      when m.identity_check='AD_DONEM_ONAYI_GEREKIR' then 'identity_review'
      when m.period_risk<>'' then 'period_review'
      when round(m.opening_balance,2)=round(m.pdf_balance,2) then 'matched'
      else 'difference'
    end,
    m.source_card_id,
    m.pdf_source,
    md5(created.id::text||'|'||m.source_card_id||'|'||m.opening_balance::text||'|'||coalesce(m.pdf_balance,0)::text)
  from matched m
  cross join created
  where m.cari_id is not null
  returning id
)
select
  (select count(*) from ins) as inserted_opening_rows,
  (select missing_count from guard) as missing_cari_matches,
  (select matched_count from guard) as matched_cari_count;

-- Hard stop if a source name did not resolve to an existing cari card.
do $$
declare
  v_missing integer;
begin
  select count(*) into v_missing
  from tmp_istasyon_opening_seed x
  left join public.cari_cards c
    on upper(regexp_replace(trim(c.cari_name),'\\s+',' ','g'))
     = upper(regexp_replace(trim(x.cari_name),'\\s+',' ','g'))
  where c.id is null;
  if v_missing > 0 then
    raise exception 'cutover staging blocked: % cari names did not match',v_missing;
  end if;
end $$;

commit;

select * from public.v_istasyon_opening_reconciliation
order by cutover_date desc,cutover_run_id desc
limit 5;
`;

await fs.writeFile(outPath,sql,'utf8');
console.log(JSON.stringify({
  ok:true,
  mode:'generate_only',
  cutover_date:cutoverDate,
  rows:seed.rows.length,
  expected_net_balance:seed.expected_net_balance,
  output:'data/istasyon-opening-stage.generated.sql',
  financial_posting:0
},null,2));
