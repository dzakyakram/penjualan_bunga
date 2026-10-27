This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Fitur CRM & tema Liquid Glass

1. Jalankan `supabase/migrations/20261026_crm_features.sql` sekali di Supabase (SQL Editor).
2. Tambahkan `NEXT_PUBLIC_WA_NUMBER` di `.env.local` (lihat `.env.example`).
3. `npm install && npm run dev`

| Fungsi CRM | Lokasi |
|---|---|
| Data pelanggan | `/akun` |
| Manajemen pesanan | `/pesanan`, `/pesanan/[id]`, admin `/admin/pesanan` |
| Pesanan khusus | `/pesanan-khusus`, admin `/admin/pesanan-khusus` |
| Layanan pelanggan | tombol WhatsApp, `/bantuan`, admin `/admin/layanan` |
| Loyalitas | `/loyalitas`, voucher dipilih di `/checkout` |
| Pemasaran terarah | pengingat di beranda & `/akun`, admin `/admin/pemasaran` |
| Umpan balik | form ulasan di `/pesanan/[id]`, admin `/admin/ulasan` |
| Analitik | `/admin` |

Tema ada di `app/globals.css` (kelas `.glass`, `.glass-soft`, `.glass-primary`, `.glass-field`).
