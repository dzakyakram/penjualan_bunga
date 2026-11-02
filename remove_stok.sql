-- Hapus kolom stok dari tabel products (fitur stok sudah dihapus dari aplikasi).
-- Jalankan di Supabase: SQL Editor -> New query -> Run.
-- Tanpa CASCADE: jika ada view/fungsi/trigger yang masih memakai kolom ini, perintah akan gagal
-- dan tidak ada yang berubah, sehingga aman.
ALTER TABLE public.products DROP COLUMN IF EXISTS stok;
