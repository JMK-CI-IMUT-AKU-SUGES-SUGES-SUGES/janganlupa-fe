import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CircleAlert, Clock3, ListChecks } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { normalizeTask, normalizeProject, denormalizeTask } from '../lib/projectUtils'
import {
  formatTaskDate,
  taskPriorityStyles,
  taskScopeStyles,
  taskStatusMeta,
  taskStatusOptions,
} from '../lib/taskBoard'
import { taskSchema, formatZodErrors } from '../lib/validation'
import { useTasks, useProjects, useInvalidate } from '../lib/queries'

const TaskDrawer = lazy(() => import('../components/TaskDrawer'))

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const scopeFilterOptions = [
  { value: 'all', label: 'Semua task' },
  { value: 'personal', label: 'Task pribadi' },
  { value: 'project', label: 'Task project' },
]

function toDateKey(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatFullDate(dateKey) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseDateKey(dateKey))
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

function getNextUpcomingTasks(tasks, selectedDate) {
  return [...tasks]
    .filter((task) => task.status !== 'selesai' && task.dueDate >= selectedDate)
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 5)
}

export default function Calendar() {
  const location = useLocation()
  const { user } = useAuth()
  const invalidate = useInvalidate()
  const todayKey = toDateKey(new Date())
  const initialSelectedDate = location.state?.selectedDate ?? todayKey

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()

  const tasks = useMemo(() => {
    return (tasksQuery.data?.tasks || []).map((t) => normalizeTask(t, user?.name))
  }, [tasksQuery.data, user?.name])

  const projects = useMemo(() => {
    return (projectsQuery.data?.projects || []).map((p) => normalizeProject(p))
  }, [projectsQuery.data])

  const loading = tasksQuery.isLoading

  const [viewDate, setViewDate] = useState(parseDateKey(initialSelectedDate))
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [scopeFilter, setScopeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesScope = scopeFilter === 'all' || task.scope === scopeFilter
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter
        return matchesScope && matchesStatus
      }),
    [tasks, scopeFilter, statusFilter]
  )

  const tasksByDate = useMemo(() => {
    const groupedTasks = new Map()

    filteredTasks.forEach((task) => {
      if (!task.dueDate) return
      const taskBucket = groupedTasks.get(task.dueDate) ?? []
      taskBucket.push(task)
      groupedTasks.set(task.dueDate, taskBucket)
    })

    return groupedTasks
  }, [filteredTasks])

  const calendarDays = useMemo(() => buildCalendarDays(year, month), [month, year])

  const selectedDateTasks = useMemo(
    () =>
      [...(tasksByDate.get(selectedDate) ?? [])].sort((left, right) => {
        const statusOrder = { berjalan: 0, belum: 1, selesai: 2 }
        return statusOrder[left.status] - statusOrder[right.status]
      }),
    [selectedDate, tasksByDate]
  )

  const monthTaskCount = useMemo(
    () =>
      filteredTasks.filter((task) => {
        if (!task.dueDate) return false
        const taskDate = parseDateKey(task.dueDate)
        return taskDate.getFullYear() === year && taskDate.getMonth() === month
      }).length,
    [filteredTasks, month, year]
  )

  const overdueTaskCount = useMemo(
    () =>
      filteredTasks.filter(
        (task) => task.status !== 'selesai' && task.dueDate && task.dueDate < todayKey
      ).length,
    [filteredTasks, todayKey]
  )

  const completedTaskCount = useMemo(
    () => filteredTasks.filter((task) => task.status === 'selesai').length,
    [filteredTasks]
  )

  const upcomingTasks = useMemo(
    () => getNextUpcomingTasks(filteredTasks, selectedDate),
    [filteredTasks, selectedDate]
  )

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks]
  )

  const changeMonth = useCallback(
    (offset) => {
      const nextDate = new Date(year, month + offset, 1)
      setViewDate(nextDate)
      setSelectedDate(toDateKey(nextDate))
    },
    [month, year]
  )

  const goToToday = useCallback(() => {
    const nextToday = parseDateKey(todayKey)
    setViewDate(nextToday)
    setSelectedDate(todayKey)
  }, [todayKey])

  const handleSelectDay = useCallback((dateKey) => {
    setSelectedDate(dateKey)
    setViewDate(parseDateKey(dateKey))
  }, [])

  const openTaskDrawer = useCallback((taskId) => {
    setActiveTaskId(taskId)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const saveTask = async (taskData) => {
    setError('')

    const result = taskSchema.safeParse(taskData)
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    try {
      const payload = denormalizeTask(taskData)
      await api.put(`/tasks/${taskData.id}`, payload)
      invalidate('tasks')
      setDrawerOpen(false)
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal menyimpan task')
    }
  }

  const deleteTask = async (taskId) => {
    setError('')

    if (!taskId) {
      setError('ID task tidak ditemukan')
      return
    }

    try {
      await api.delete(`/tasks/${taskId}`)
      invalidate('tasks')
      setDrawerOpen(false)
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal menghapus task')
    }
  }

  return (
    <AppLayout active="Calendar">
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {error}
        </div>
      ) : null}
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Calendar
          </p>
          <h1 className="mt-2 text-3xl font-black text-brand-navy md:text-4xl">
            Kalender tugas
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {loading ? (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              Loading...
            </span>
          ) : (
            <>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {monthTaskCount} task bulan ini
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
                {overdueTaskCount} lewat deadline
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {completedTaskCount} selesai
              </span>
            </>
          )}
        </div>
      </section>

      <section className="relative z-20 mb-6 overflow-visible rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-[240px_240px_180px] xl:justify-end">
          <FilterDropdown
            label="Kategori task"
            options={scopeFilterOptions}
            value={scopeFilter}
            onChange={setScopeFilter}
            emptyLabel="Pilih kategori"
          />

          <FilterDropdown
            label="Status"
            options={[{ value: 'all', label: 'Semua status' }, ...taskStatusOptions]}
            value={statusFilter}
            onChange={setStatusFilter}
            emptyLabel="Pilih status"
          />

          <button
            type="button"
            onClick={goToToday}
            className="inline-flex min-h-[72px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
          >
            Hari ini
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                Bulan aktif
              </p>
              <h2 className="mt-2 text-2xl font-black text-brand-navy">
                {formatMonthLabel(viewDate)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition hover:border-brand/20 hover:bg-blue-50 hover:text-brand"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition hover:border-brand/20 hover:bg-blue-50 hover:text-brand"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-2 text-center">
            {weekDays.map((dayLabel) => (
              <div
                key={dayLabel}
                className="py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"
              >
                {dayLabel}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell) => {
              const cellTasks = tasksByDate.get(cell.dateKey) ?? []
              const isSelected = cell.dateKey === selectedDate
              const isToday = cell.dateKey === todayKey

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => handleSelectDay(cell.dateKey)}
                  className={`min-h-[92px] cursor-pointer rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-brand bg-brand-navy text-white shadow-lg shadow-brand/15'
                      : cell.currentMonth
                        ? 'border-slate-200 bg-slate-50/80 text-brand-navy hover:border-brand/20 hover:bg-blue-50/70'
                        : 'border-slate-100 bg-slate-50/50 text-slate-300'
                  } ${isToday && !isSelected ? 'ring-2 ring-brand/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : ''}`}>
                      {cell.day}
                    </span>
                    {cellTasks.length > 0 ? (
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-white text-brand shadow-sm'
                        }`}
                      >
                        {cellTasks.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1">
                    {cellTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected
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
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Agenda
                </p>
                <h2 className="mt-2 text-2xl font-black text-brand-navy">
                  {formatFullDate(selectedDate)}
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {selectedDateTasks.length} task
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openTaskDrawer(task.id)}
                    className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${taskStatusMeta[task.status].cardTone}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${taskScopeStyles[task.scope]}`}
                          >
                            {task.scope === 'project' ? task.projectName : 'Pribadi'}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${taskPriorityStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-3 truncate text-base font-black text-brand-navy">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{task.assignee}</p>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${taskStatusMeta[task.status].tone}`}>
                        {taskStatusMeta[task.status].title}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className={`h-2 overflow-hidden rounded-full ${taskStatusMeta[task.status].progressTrackTone}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${taskStatusMeta[task.status].progressTone}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
                  Tidak ada task di tanggal ini.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Deadline berikutnya
                </p>
                <h2 className="mt-2 text-2xl font-black text-brand-navy">Fokus lanjut</h2>
              </div>
              <ListChecks className="h-6 w-6 text-brand" />
            </div>

            <div className="mt-5 space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openTaskDrawer(task.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-black text-brand-navy">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${taskScopeStyles[task.scope]}`}
                        >
                          {task.scope === 'project' ? task.projectName : 'Pribadi'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{task.assignee}</span>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatTaskDate(task.dueDate)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
                  Semua task untuk filter ini sudah kosong.
                </div>
              )}
            </div>

            {overdueTaskCount > 0 ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                <CircleAlert className="h-4 w-4" />
                {overdueTaskCount} task masih lewat deadline.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {drawerOpen ? (
        <Suspense fallback={null}>
          <TaskDrawer
            key={activeTask?.id ?? 'calendar-task'}
            open={drawerOpen}
            mode="edit"
            task={activeTask}
            onClose={closeDrawer}
            onSave={saveTask}
            onDelete={deleteTask}
            projects={projects}
            scopeMode={activeTask?.scope === 'project' ? 'projectOnly' : 'personalOnly'}
            lockAssignee
            lockedProjectId={activeTask?.projectId ?? ''}
          />
        </Suspense>
      ) : null}
    </AppLayout>
  )
}
