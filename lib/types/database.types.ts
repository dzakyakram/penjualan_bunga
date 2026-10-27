export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Tbl<Row, Required extends keyof Row> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, Required>
  Update: Partial<Row>
  Relationships: []
}

export type ImportantDate = {
  id: string
  user_id: string
  judul: string
  tanggal: string
  catatan: string | null
  created_at: string | null
}

export type CustomOrderStatus = 'Diterima' | 'Penawaran' | 'Dikerjakan' | 'Selesai' | 'Batal'

export type CustomOrder = {
  id: string
  user_id: string
  jenis_bunga: string
  warna: string
  ukuran: string
  budget: number | null
  tanggal_dibutuhkan: string | null
  catatan: string | null
  referensi_url: string | null
  status: CustomOrderStatus
  harga_penawaran: number | null
  catatan_admin: string | null
  created_at: string | null
  updated_at: string | null
}

export type SupportTicket = {
  id: string
  user_id: string
  tipe: 'pertanyaan' | 'keluhan'
  order_id: string | null
  subjek: string
  pesan: string
  status: 'Baru' | 'Diproses' | 'Selesai'
  balasan: string | null
  created_at: string | null
  updated_at: string | null
}

export type LoyaltyEntry = {
  id: string
  user_id: string
  order_id: string | null
  poin: number
  keterangan: string
  created_at: string | null
}

export type Voucher = {
  id: string
  nama: string
  poin_dibutuhkan: number
  potongan: number
  min_belanja: number
  is_active: boolean
  created_at: string | null
}

export type UserVoucher = {
  id: string
  user_id: string
  voucher_id: string
  kode: string
  used_at: string | null
  order_id: string | null
  created_at: string | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nama: string
          no_hp: string | null
          alamat: string | null
          role: 'pembeli' | 'admin'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          nama: string
          no_hp?: string | null
          alamat?: string | null
          role?: 'pembeli' | 'admin'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nama?: string
          no_hp?: string | null
          alamat?: string | null
          role?: 'pembeli' | 'admin'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          nama_kategori: string
          created_at: string | null
        }
        Insert: {
          id?: string
          nama_kategori: string
          created_at?: string | null
        }
        Update: {
          id?: string
          nama_kategori: string
          created_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          kategori_id: string | null
          nama_produk: string
          deskripsi: string | null
          harga: number
          stok: number
          gambar_url: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          kategori_id?: string | null
          nama_produk: string
          deskripsi?: string | null
          harga: number
          stok: number
          gambar_url?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          kategori_id?: string | null
          nama_produk?: string
          deskripsi?: string | null
          harga?: number
          stok?: number
          gambar_url?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          produk_id: string
          jumlah: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          produk_id: string
                    jumlah: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          produk_id?: string
          jumlah?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          alamat_kirim: string
          tanggal_kirim: string
          kartu_ucapan: string | null
          status: 'Menunggu Bayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Batal'
          diskon: number
          user_voucher_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          diskon?: number
          user_voucher_id?: string | null
          user_id: string
          total: number
          alamat_kirim: string
          tanggal_kirim: string
          kartu_ucapan?: string | null
          status?: 'Menunggu Bayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Batal'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          diskon?: number
          user_voucher_id?: string | null
          user_id?: string
          total?: number
          alamat_kirim?: string
          tanggal_kirim?: string
          kartu_ucapan?: string | null
          status?: 'Menunggu Bayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Batal'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          produk_id: string
          jumlah: number
          harga_satuan: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          produk_id: string
          jumlah: number
          harga_satuan: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          produk_id?: string
          jumlah?: number
          harga_satuan?: number
          created_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          metode: string
          bukti_bayar_url: string | null
          status_verifikasi: 'Menunggu' | 'Valid' | 'Ditolak'
          verified_by: string | null
          verified_at: string | null
          catatan: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          metode: string
          bukti_bayar_url?: string | null
          status_verifikasi?: 'Menunggu' | 'Valid' | 'Ditolak'
          verified_by?: string | null
          verified_at?: string | null
          catatan?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          metode?: string
          bukti_bayar_url?: string | null
          status_verifikasi?: 'Menunggu' | 'Valid' | 'Ditolak'
          verified_by?: string | null
          verified_at?: string | null
          catatan?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          produk_id: string
          order_id: string
          rating: number
          komentar: string | null
          is_hidden: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          produk_id: string
          order_id: string
          rating: number
          komentar?: string | null
          is_hidden?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          produk_id?: string
          order_id?: string
          rating?: number
          komentar?: string | null
          is_hidden?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      important_dates: Tbl<ImportantDate, 'user_id' | 'judul' | 'tanggal'>
      custom_orders: Tbl<CustomOrder, 'user_id' | 'jenis_bunga' | 'warna' | 'ukuran'>
      support_tickets: Tbl<SupportTicket, 'user_id' | 'tipe' | 'subjek' | 'pesan'>
      loyalty_ledger: Tbl<LoyaltyEntry, 'user_id' | 'poin' | 'keterangan'>
      vouchers: Tbl<Voucher, 'nama' | 'poin_dibutuhkan' | 'potongan'>
      user_vouchers: Tbl<UserVoucher, 'user_id' | 'voucher_id' | 'kode'>
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      checkout_create_order: {
        Args: {
          p_user_id: string
          p_alamat_kirim: string
          p_tanggal_kirim: string
          p_kartu_ucapan: string
        }
        Returns: {
          order_id: string
          total: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
