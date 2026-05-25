import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const calendarTasks = [
  {
    title: 'Interaksi Manusia dan Komputer',
    desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
  {
    title: 'Pemograman Web',
    desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
  {
    title: 'Bahasa Indonesia',
    desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
]

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const cells = []

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, current: false })
  }
  return cells
}

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const dayNames = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
]

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date(2029, 0, 10))
  const selectedDay = 10

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = buildCalendarDays(year, month)

  const headerDate = `${dayNames[viewDate.getDay()]}, ${selectedDay} ${monthNames[month]} ${year}`

  return (
    <AppLayout active="Kalender">
      <h1 className="mb-8 text-3xl font-bold text-brand">Kalender</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{headerDate}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(year, month - 1, selectedDay))
                }
                className="rounded-lg p-1.5 hover:bg-white/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(year, month + 1, selectedDay))
                }
                className="rounded-lg p-1.5 hover:bg-white/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-800">
            {weekDays.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((cell, i) => (
              <button
                key={i}
                type="button"
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                  cell.current && cell.day === selectedDay
                    ? 'bg-brand font-semibold text-white'
                    : cell.current
                      ? 'text-gray-900 hover:bg-white/60'
                      : 'text-gray-400'
                }`}
              >
                {cell.day}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Daftar Tugas Kamu
          </h2>
          <p className="mb-6 text-sm font-medium text-brand">
            Senin, 13 Januari 2029
          </p>

          <div className="space-y-4">
            {calendarTasks.map((task) => (
              <div
                key={task.title}
                className="rounded-xl bg-white p-5 shadow-md"
              >
                <h3 className="font-bold text-gray-900">{task.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {task.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
