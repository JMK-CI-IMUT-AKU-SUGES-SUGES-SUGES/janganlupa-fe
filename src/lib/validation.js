import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(1, 'Password wajib diisi')
  .min(8, 'Password minimal 8 karakter')
  .max(100, 'Password maksimal 100 karakter')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[0-9]/, 'Password harus mengandung angka')

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nama wajib diisi')
      .min(2, 'Nama minimal 2 karakter')
      .max(50, 'Nama maksimal 50 karakter')
      .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh mengandung huruf dan spasi'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul task wajib diisi')
    .max(200, 'Judul task maksimal 200 karakter'),
  description: z.string().max(2000, 'Deskripsi maksimal 2000 karakter').optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  label: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  links: z.array(z.object({
    id: z.string().optional(),
    label: z.string().max(100, 'Label link maksimal 100 karakter').optional(),
    url: z.string().optional(),
  })).optional(),
})

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama project wajib diisi')
    .max(100, 'Nama project maksimal 100 karakter'),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter')
    .optional(),
  deadline_date: z.string().optional(),
  deadline: z.string().optional(),
  links: z.array(z.object({
    id: z.string(),
    label: z.string().max(100).optional(),
    url: z.string().url('URL tidak valid').or(z.literal('')).optional(),
  })).optional(),
})

export const partnerSlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug partner wajib diisi')
    .regex(
      /^@?[a-z0-9-]+$/,
      'Slug hanya boleh mengandung huruf kecil, angka, dan tanda strip'
    )
    .max(50, 'Slug maksimal 50 karakter'),
})

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  slug: z
    .string()
    .min(1, 'Slug wajib diisi'),
  timezone: z.string().optional(),
  role_label: z.string().optional(),
  focus: z.string().max(500, 'Fokus maksimal 500 karakter').optional(),
  status: z.string().optional(),
})

export const inviteMemberSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug partner wajib diisi'),
  role: z
    .string()
    .min(1, 'Role wajib dipilih'),
})

export function formatZodErrors(error) {
  return error.errors.map((e) => e.message).join(', ')
}
