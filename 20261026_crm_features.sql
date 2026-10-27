-- =====================================================================
-- Fitur CRM Toko Bunga
-- Jalankan sekali di Supabase: SQL Editor -> New query -> Run
-- Aman dijalankan ulang (memakai IF NOT EXISTS / ON CONFLICT).
-- =====================================================================

-- 1. Tanggal penting pelanggan (ulang tahun, anniversary, dll.)
create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  judul text not null,
  tanggal date not null,              -- tahun diabaikan, berulang setiap tahun
  catatan text,
  created_at timestamptz default now()
);
create index if not exists important_dates_user_idx on public.important_dates(user_id);

-- 2. Pesanan khusus (custom order)
create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  jenis_bunga text not null,
  warna text not null,
  ukuran text not null,
  budget numeric,
  tanggal_dibutuhkan date,
  catatan text,
  referensi_url text,
  status text not null default 'Diterima'
    check (status in ('Diterima','Penawaran','Dikerjakan','Selesai','Batal')),
  harga_penawaran numeric,
  catatan_admin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists custom_orders_user_idx on public.custom_orders(user_id);

-- 3. Layanan pelanggan: pertanyaan & keluhan
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipe text not null check (tipe in ('pertanyaan','keluhan')),
  order_id uuid references public.orders(id) on delete set null,
  subjek text not null,
  pesan text not null,
  status text not null default 'Baru' check (status in ('Baru','Diproses','Selesai')),
  balasan text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id);

-- 4. Program loyalitas
create table if not exists public.loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  poin integer not null,              -- positif = dapat, negatif = tukar
  keterangan text not null,
  created_at timestamptz default now()
);
create index if not exists loyalty_ledger_user_idx on public.loyalty_ledger(user_id);
-- satu pesanan hanya boleh memberi poin satu kali
create unique index if not exists loyalty_one_earn_per_order
  on public.loyalty_ledger(order_id) where poin > 0 and order_id is not null;

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  poin_dibutuhkan integer not null check (poin_dibutuhkan > 0),
  potongan numeric not null check (potongan > 0),
  min_belanja numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.user_vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voucher_id uuid not null references public.vouchers(id),
  kode text not null unique,
  used_at timestamptz,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists user_vouchers_user_idx on public.user_vouchers(user_id);

-- kolom tambahan di pesanan untuk diskon voucher
alter table public.orders add column if not exists diskon numeric not null default 0;
alter table public.orders add column if not exists user_voucher_id uuid references public.user_vouchers(id);

-- voucher awal (boleh diubah lewat Table Editor)
insert into public.vouchers (nama, poin_dibutuhkan, potongan, min_belanja)
select * from (values
  ('Potongan Rp10.000',  50,  10000::numeric, 100000::numeric),
  ('Potongan Rp25.000', 100,  25000::numeric, 200000::numeric),
  ('Potongan Rp75.000', 250,  75000::numeric, 500000::numeric)
) as v(nama, poin_dibutuhkan, potongan, min_belanja)
where not exists (select 1 from public.vouchers);

-- 5. Bucket gambar referensi pesanan khusus
insert into storage.buckets (id, name, public)
values ('referensi-custom', 'referensi-custom', true)
on conflict (id) do nothing;

-- 6. Row Level Security
-- Halaman admin memakai service role (melewati RLS), jadi kebijakan di sini
-- hanya mengatur akses pelanggan ke data miliknya sendiri.
alter table public.important_dates enable row level security;
alter table public.custom_orders   enable row level security;
alter table public.support_tickets enable row level security;
alter table public.loyalty_ledger  enable row level security;
alter table public.vouchers        enable row level security;
alter table public.user_vouchers   enable row level security;

drop policy if exists "dates_own"      on public.important_dates;
drop policy if exists "custom_select"  on public.custom_orders;
drop policy if exists "custom_insert"  on public.custom_orders;
drop policy if exists "tickets_select" on public.support_tickets;
drop policy if exists "tickets_insert" on public.support_tickets;
drop policy if exists "ledger_select"  on public.loyalty_ledger;
drop policy if exists "vouchers_read"  on public.vouchers;
drop policy if exists "uv_select"      on public.user_vouchers;

create policy "dates_own" on public.important_dates
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "custom_select" on public.custom_orders
  for select to authenticated using (auth.uid() = user_id);
create policy "custom_insert" on public.custom_orders
  for insert to authenticated with check (auth.uid() = user_id);

create policy "tickets_select" on public.support_tickets
  for select to authenticated using (auth.uid() = user_id);
create policy "tickets_insert" on public.support_tickets
  for insert to authenticated with check (auth.uid() = user_id);

create policy "ledger_select" on public.loyalty_ledger
  for select to authenticated using (auth.uid() = user_id);

create policy "vouchers_read" on public.vouchers
  for select to authenticated using (is_active);

create policy "uv_select" on public.user_vouchers
  for select to authenticated using (auth.uid() = user_id);

-- Poin & voucher hanya ditulis oleh server (service role), bukan oleh browser.
