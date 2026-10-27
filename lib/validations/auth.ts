import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  no_hp: z.string().min(10, 'Nomor HP tidak valid').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const profileSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  no_hp: z.string().min(10, 'Nomor HP tidak valid').optional().or(z.literal('')),
  alamat: z.string().optional().or(z.literal('')),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
