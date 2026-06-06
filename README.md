# JanganLupa.id

Frontend React untuk aplikasi manajemen tugas mahasiswa.

## Tech Stack

- React 19 + Vite
- React Router
- Tailwind CSS v4
- Lucide React (ikon)
- Axios

## Halaman

| Route       | Halaman                          |
| ----------- | -------------------------------- |
| `/`         | Landing                          |
| `/login`    | Login                            |
| `/register` | Register                         |
| `/dashboard`| Dashboard utama                  |
| `/mytask`   | Kanban My Task                   |
| `/projects` | Workspace Projects               |
| `/projects/:id` | Project Detail (task + member)|
| `/calendar` | Kalender & daftar tugas harian   |
| `/partner`  | Partner hub                      |
| `/profile`  | Profil pengguna                  |

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173

Backend harus jalan di http://localhost:8000 (`php artisan serve`)

## Build production

```bash
npm run build
npm run preview
```

## Akun Testing (Seeder)

Semua password: **`rahasia`**

| Name           | Email                     | Slug           |
| -------------- | ------------------------- | -------------- |
| Narendra       | narendra@janganlupa.dev   | @narendra.dev  |
| Ardhiva Putra  | ardhiva@janganlupa.dev    | @ardhiva       |
| Sinta Dewi     | sinta@janganlupa.dev      | @sinta.dewi    |
| Budi Santoso   | budi@janganlupa.dev       | @budi.s        |
