import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  FolderOpen,
  ListTodo,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { normalizeTask, normalizeProject, getProjectPeople, getProjectTaskStats } from '../lib/projectUtils'
import { formatTaskDate } from '../lib/taskBoard'

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function addDays(dateValue, days) {
  const nextDate = new Date(`${dateValue}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildCalendarDays(year, month) {
  const firstVisibleDay = new Date(year, month, 1 - new Date(year, month, 1).getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay)
    date.setDate(firstVisibleDay.getDate() + index)

    return {
      dateKey: toDateKey(date),
      day: date.getDate(),
      currentMonth: date.getMonth() === month,
    }
  })
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function SummaryLink({ to, icon: Icon, label, metric, detail, footer }) {
  return (
    <Link
      to={to}
      className="group rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-2xl hover:shadow-brand/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-brand-navy/15">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-brand" />
      </div>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-brand">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-brand-navy">{metric}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{detail}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {footer}
      </p>
    </Link>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Selamat pagi'
  if (hour >= 12 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Dashboard() {
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [connectedPartnerCount, setConnectedPartnerCount] = useState(0)
  const [pendingPartnerCount, setPendingPartnerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)

      const [tasksRes, projectsRes, partnersRes, requestsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/partners'),
        api.get('/partners/requests'),
      ])

      const normalizedTasks = (tasksRes.data.data.tasks || []).map((t) =>
        normalizeTask(t, user.name)
      )
      const normalizedProjects = (projectsRes.data.data.projects || []).map((p) =>
        normalizeProject(p)
      )

      setTasks(normalizedTasks)
      setProjects(normalizedProjects)
      setConnectedPartnerCount(partnersRes.data.data.partners?.length || 0)

      const incoming = requestsRes.data.data.incoming || []
      const outgoing = requestsRes.data.data.outgoing || []
      setPendingPartnerCount(incoming.length + outgoing.length)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.name])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const today = new Date()
  const todayKey = toDateKey(today)
  const weekAheadKey = addDays(todayKey, 7)

  const activeTasks = tasks.filter((task) => task.status !== 'selesai')
  const projectTasks = tasks.filter((task) => task.scope === 'project')
  const personalTasks = tasks.filter((task) => task.scope === 'personal')

  const deadlinesThisWeek = [...activeTasks]
    .filter((task) => task.dueDate && task.dueDate >= todayKey && task.dueDate <= weekAheadKey)
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))

  const focusedProject = projects[0] ?? null
  const focusedProjectStats = focusedProject
    ? getProjectTaskStats(tasks, focusedProject.id, focusedProject.progress)
    : { total: 0, progress: 0, done: 0, active: 0, backlog: 0 }
  const focusedProjectPeople = focusedProject ? getProjectPeople(focusedProject) : []

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today)

  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const calendarDays = buildCalendarDays(currentMonthDate.getFullYear(), currentMonthDate.getMonth())

  const tasksByDate = tasks.reduce((map, task) => {
    if (!task.dueDate) return map
    const bucket = map.get(task.dueDate) ?? []
    bucket.push(task)
    map.set(task.dueDate, bucket)
    return map
  }, new Map())

  const workloadSeries = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(todayKey, index)
    const dailyTasks = tasks.filter((task) => task.dueDate === dateKey)
    const done = dailyTasks.filter((task) => task.status === 'selesai').length
    const active = dailyTasks.filter((task) => task.status === 'berjalan').length
    const backlog = dailyTasks.filter((task) => task.status === 'belum').length

    return {
      dateKey,
      label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(
        new Date(`${dateKey}T00:00:00`)
      ),
      total: dailyTasks.length,
      done,
      active,
      backlog,
    }
  })

  const maxWorkload = Math.max(...workloadSeries.map((item) => item.total), 1)
  const completionRate = tasks.length
    ? Math.round((tasks.filter((task) => task.status === 'selesai').length / tasks.length) * 100)
    : 0

  const summaryLinks = [
    {
      to: '/mytask',
      icon: ListTodo,
      label: 'My Task',
      metric: `${activeTasks.length} aktif`,
      detail: `${projectTasks.length} task project`,
      footer: `${personalTasks.length} task pribadi`,
    },
    {
      to: '/projects',
      icon: FolderOpen,
      label: 'Projects',
      metric: `${projects.length} workspace`,
      detail: focusedProject ? focusedProject.name : 'Belum ada project',
      footer: `${focusedProjectStats.progress}% progress`,
    },
    {
      to: '/calendar',
      icon: CalendarDays,
      label: 'Calendar',
      metric: `${deadlinesThisWeek.length} deadline`,
      detail: deadlinesThisWeek[0]
        ? `Terdekat ${formatTaskDate(deadlinesThisWeek[0].dueDate)}`
        : 'Minggu ini aman',
      footer: `${tasks.length} agenda bulan ini`,
    },
    {
      to: '/partner',
      icon: Users,
      label: 'Partner',
      metric: `${connectedPartnerCount} terhubung`,
      detail: `${pendingPartnerCount} perlu ditindak`,
      footer: `${focusedProjectPeople.length} partner di project fokus`,
    },
  ]

  if (loading) {
    return (
      <AppLayout active="Dashboard">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm font-bold text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout active="Dashboard">
      <section className="mb-6 overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] px-8 py-6 text-white shadow-2xl shadow-brand/15">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-100">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-black md:text-3xl">
              {getGreeting()}, {user?.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-white/75">{todayLabel}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/mytask"
                state={{ openCreateTask: true }}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-navy shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <Zap className="h-4 w-4" />
                Tambah task
              </Link>
              <Link
                to="/calendar"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <CalendarDays className="h-4 w-4" />
                Lihat kalender
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Task aktif
              </p>
              <p className="mt-2 text-2xl font-black text-white">{activeTasks.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Deadline dekat
              </p>
              <p className="mt-2 text-2xl font-black text-white">{deadlinesThisWeek.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Progress
              </p>
              <p className="mt-2 text-2xl font-black text-white">{completionRate}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryLinks.map((item) => (
          <SummaryLink key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                Mini calendar
              </p>
              <h2 className="mt-2 text-2xl font-black text-brand-navy">
                {formatMonthLabel(currentMonthDate)}
              </h2>
            </div>
            <Link
              to="/calendar"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:text-brand"
            >
              Buka
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center">
            {weekDays.map((dayLabel) => (
              <div
                key={dayLabel}
                className="py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400"
              >
                {dayLabel}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((cell) => {
              const cellTasks = tasksByDate.get(cell.dateKey) ?? []
              const isToday = cell.dateKey === todayKey

              return (
                <Link
                  key={cell.dateKey}
                  to="/calendar"
                  state={{ selectedDate: cell.dateKey }}
                  className={`min-h-[64px] rounded-2xl border p-2 text-left transition hover:-translate-y-0.5 ${
                    isToday
                      ? 'border-brand bg-brand-navy text-white shadow-lg shadow-brand/10'
                      : cell.currentMonth
                        ? 'border-slate-200 bg-slate-50/80 text-brand-navy hover:border-brand/20 hover:bg-blue-50/70'
                        : 'border-slate-100 bg-slate-50/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-black">{cell.day}</span>
                    {cellTasks.length > 0 ? (
                      <span
                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                          isToday ? 'bg-white/15 text-white' : 'bg-white text-brand shadow-sm'
                        }`}
                      >
                        {cellTasks.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {cellTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`h-2 w-2 rounded-full ${
                          isToday
                            ? 'bg-white/80'
                            : task.status === 'selesai'
                              ? 'bg-emerald-500'
                              : task.status === 'berjalan'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-5 space-y-3">
            {deadlinesThisWeek.slice(0, 3).map((task) => (
              <Link
                key={task.id}
                to="/calendar"
                state={{ selectedDate: task.dueDate }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white"
              >
                <div className="min-w-0">
                  <p className="truncate font-black text-brand-navy">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {task.scope === 'project' ? task.projectName : 'Task pribadi'}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm">
                  {formatTaskDate(task.dueDate)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                Grafik pengerjaan
              </p>
              <h2 className="mt-2 text-2xl font-black text-brand-navy">
                Ritme 7 hari
              </h2>
            </div>
            <Sparkles className="h-6 w-6 text-brand" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Belum
              </p>
              <p className="mt-2 text-2xl font-black text-brand-navy">
                {activeTasks.filter((task) => task.status === 'belum').length}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Berjalan
              </p>
              <p className="mt-2 text-2xl font-black text-brand-navy">
                {activeTasks.filter((task) => task.status === 'berjalan').length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Selesai
              </p>
              <p className="mt-2 text-2xl font-black text-brand-navy">
                {tasks.filter((task) => task.status === 'selesai').length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-end gap-3 rounded-[28px] border border-slate-200 bg-slate-50/80 px-4 py-5">
              {workloadSeries.map((item) => (
                <div key={item.dateKey} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-full bg-slate-300/90 transition"
                      style={{ height: `${Math.max((item.backlog / maxWorkload) * 100, item.backlog ? 16 : 6)}%` }}
                    />
                    <div
                      className="w-3 rounded-full bg-blue-500/90 transition"
                      style={{ height: `${Math.max((item.active / maxWorkload) * 100, item.active ? 16 : 6)}%` }}
                    />
                    <div
                      className="w-3 rounded-full bg-emerald-500/90 transition"
                      style={{ height: `${Math.max((item.done / maxWorkload) * 100, item.done ? 16 : 6)}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {completionRate}% completion rate
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
              {focusedProject ? focusedProject.name : 'Belum ada project'}
            </span>
          </div>

          <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Project focus
                </p>
                <h3 className="mt-2 text-xl font-black text-brand-navy">
                  {focusedProject ? focusedProject.name : 'Belum ada project'}
                </h3>
              </div>
              <Link
                to={focusedProject ? `/projects/${focusedProject.id}` : '/projects'}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-brand-navy px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition hover:-translate-y-0.5 hover:bg-brand"
              >
                <FolderOpen className="h-4 w-4" />
                Buka
              </Link>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300"
                style={{ width: `${focusedProjectStats.progress}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Progress
                </p>
                <p className="mt-1 text-lg font-black text-brand-navy">
                  {focusedProjectStats.progress}%
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Task
                </p>
                <p className="mt-1 text-lg font-black text-brand-navy">
                  {focusedProjectStats.total}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Partner
                </p>
                <p className="mt-1 text-lg font-black text-brand-navy">
                  {focusedProjectPeople.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
