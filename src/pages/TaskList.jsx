import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import TaskModal from '../components/TaskModal'

const labelStyles = {
  Pemweb: 'bg-blue-100 text-blue-700',
  PBO: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-700',
}

const columns = [
  {
    id: 'belum',
    title: 'Belum Selesai',
    tasks: [
      { label: 'Pemweb', labelKey: 'Pemweb' },
      { label: 'PBO', labelKey: 'PBO' },
    ],
  },
  {
    id: 'berjalan',
    title: 'Berjalan',
    tasks: [
      { label: 'Pemweb', labelKey: 'Pemweb' },
      { label: 'PBO', labelKey: 'PBO' },
    ],
  },
  {
    id: 'selesai',
    title: 'Selesai',
    tasks: [
      { label: 'Pemweb', labelKey: 'done' },
      { label: 'PBO', labelKey: 'done' },
    ],
  },
]

function KanbanCard({ label, labelKey, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-white p-4 text-left shadow-md transition-shadow hover:shadow-lg"
    >
      <span
        className={`mb-3 inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${labelStyles[labelKey]}`}
      >
        {label}
      </span>
      <h4 className="font-bold text-gray-900">Lorem Ipsum</h4>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </p>
    </button>
  )
}

export default function TaskList() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <AppLayout active="Daftar Tugas">
      <h1 className="mb-6 text-3xl font-bold text-brand">Daftar Tugas</h1>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Pencarian"
            className="w-full rounded-lg border border-gray-800/30 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        {['Prioritas', 'Label'].map((filter) => (
          <div key={filter} className="relative min-w-[140px]">
            <select className="w-full appearance-none rounded-lg border border-gray-800/30 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand">
              <option>{filter}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id}>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
              <span className="font-semibold text-gray-800">{col.title}</span>
              <span className="text-sm font-medium text-muted">
                {col.tasks.length}
              </span>
            </div>
            <div className="space-y-4">
              {col.tasks.map((task, i) => (
                <KanbanCard
                  key={`${col.id}-${i}`}
                  label={task.label}
                  labelKey={task.labelKey}
                  onClick={() => setModalOpen(true)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg border border-gray-900 bg-white px-8 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Tambah Tugas
        </button>
      </div>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppLayout>
  )
}
