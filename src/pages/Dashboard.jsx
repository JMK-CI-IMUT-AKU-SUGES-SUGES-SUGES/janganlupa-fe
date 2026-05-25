import { Link } from 'react-router-dom'
import { Plus, TrendingUp } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'

const courses = ['Pemweb', 'PBO', 'IMK', 'Bhs. Indo']

const tasks = [
  {
    title: 'Pemograman Berbasis Orientasi (PBO)',
    deadline: '2 Hari Lagi',
    progress: 100,
  },
  {
    title: 'Interaksi Manusia dan Komputer',
    deadline: '4 Hari Lagi',
    progress: 60,
  },
  {
    title: 'Bahasa Indonesia',
    deadline: '6 Hari Lagi',
    progress: 35,
  },
]

export default function Dashboard() {
  return (
    <AppLayout active="Beranda">
      <div className="mb-8 rounded-2xl bg-white px-8 py-10 text-center shadow-md">
        <h1 className="text-3xl font-bold text-brand md:text-4xl">
          Selamat Pagi, Narendra!
        </h1>
        <p className="mt-2 text-lg text-brand-light">
          Mau apa nih kita hari ini?
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-brand">
          Daftar Mata Kuliah:
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {courses.map((course) => (
            <span
              key={course}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-brand shadow-sm"
            >
              {course}
            </span>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-brand shadow-sm transition-colors hover:bg-brand/5"
          >
            <Plus className="h-4 w-4" />
            Tambah Matkul
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
          <h3 className="mb-5 text-lg font-bold text-gray-800">
            Daftar Tugas dan Deadline
          </h3>
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <div key={task.title} className="py-4 first:pt-0 last:pb-0">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                    {task.deadline}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-gray-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">Klik untuk unggah</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Link
            to="/kalender"
            className="block rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <h3 className="font-bold text-gray-800">Hari ini</h3>
            <p className="mt-2 text-xl font-bold text-gray-900">
              Rabu, 10 Januari 2029
            </p>
            <p className="mt-3 text-xs text-muted">
              Klik untuk melihat kalender
            </p>
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-4 font-bold text-gray-800">Kemampuan</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <TrendingUp className="h-8 w-8 text-brand" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Kamu memiliki kemampuan di atas rata rata!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
