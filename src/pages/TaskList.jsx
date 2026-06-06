import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Plus, Search, X } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import TaskBoard from '../components/TaskBoard'
import { createTaskDraft } from '../lib/taskBoard'
import api from '../lib/api'
import { taskSchema, formatZodErrors } from '../lib/validation'
import { normalizeTask } from '../lib/projectUtils'

const TaskDrawer = lazy(() => import('../components/TaskDrawer'))

const taskCategoryOptions = [
  { value: 'personal', label: 'Task pribadi' },
  { value: 'project', label: 'Task project' },
]

const priorityOptions = [
  { value: 'tinggi', label: 'Prioritas tinggi' },
  { value: 'sedang', label: 'Prioritas sedang' },
  { value: 'rendah', label: 'Prioritas rendah' },
]

const allScopeValues = taskCategoryOptions.map((option) => option.value)
const allPriorityValues = priorityOptions.map((option) => option.value)

export default function TaskList() {
  const { user } = useAuth()
  const location = useLocation()
  
  const shouldOpenCreate = Boolean(location.state?.openCreateTask)
  
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  const [selectedScopes, setSelectedScopes] = useState(allScopeValues)
  const [selectedPriorities, setSelectedPriorities] = useState(allPriorityValues)
  
  const [drawerOpen, setDrawerOpen] = useState(shouldOpenCreate)
  const [drawerMode, setDrawerMode] = useState(shouldOpenCreate ? 'create' : 'edit')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [createStatus, setCreateStatus] = useState('belum')

  const fetchTasks = useCallback(async (search = '') => {
    try {
      setLoading(true)
      const res = await api.get('/tasks', { params: { search } })
      
      const normalizedTasks = res.data.data.tasks.map((task) =>
        normalizeTask(task, user.name)
      )

      setTasks(normalizedTasks)
    } catch {
      toast.error('Gagal memuat tugas')
    } finally {
      setLoading(false)
    }
  }, [user.name])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.data.data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects', error)
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    fetchTasks(debouncedSearch)
  }, [debouncedSearch, fetchTasks])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const personalTasksCount = useMemo(
    () => tasks.filter((task) => task.scope === 'personal').length,
    [tasks]
  )

  const projectTasksCount = useMemo(
    () => tasks.filter((task) => task.scope === 'project').length,
    [tasks]
  )

  const doneTasksCount = useMemo(
    () => tasks.filter((task) => task.status === 'selesai').length,
    [tasks]
  )

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesScope = selectedScopes.includes(task.scope)
        const priorityVal = task.priority?.toLowerCase() || 'sedang'
        const matchesPriority = selectedPriorities.includes(priorityVal)
        return matchesScope && matchesPriority
      }),
    [tasks, selectedPriorities, selectedScopes]
  )

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedScopes.length !== taskCategoryOptions.length ||
    selectedPriorities.length !== priorityOptions.length

  const activeTask = useMemo(() => {
    if (drawerMode === 'edit') {
      return tasks.find((task) => task.id === activeTaskId) ?? null
    }
    return createTaskDraft({
      assignee: user.name,
      status: createStatus,
    })
  }, [activeTaskId, createStatus, drawerMode, tasks, user.name])

  const toggleOption = useCallback((value, setter) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }, [])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedScopes(allScopeValues)
    setSelectedPriorities(allPriorityValues)
  }, [])

  const openCreateDrawer = useCallback((status = 'belum') => {
    setCreateStatus(status)
    setDrawerMode('create')
    setDrawerOpen(true)
  }, [])

  const openTaskDrawer = useCallback((taskId) => {
    setActiveTaskId(taskId)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const saveTask = async (taskData) => {
    const result = taskSchema.safeParse(taskData)
    if (!result.success) {
      toast.error(formatZodErrors(result.error))
      return
    }

    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority?.toLowerCase(),
        due_date: taskData.dueDate || null,
        project_id: taskData.scope === 'project' ? taskData.projectId : null,
        links: taskData.links || []
      }

      if (drawerMode === 'create') {
        await api.post('/tasks', payload)
      } else {
        await api.put(`/tasks/${taskData.id}`, payload)
      }
      toast.success(drawerMode === 'create' ? 'Task berhasil dibuat' : 'Task berhasil diperbarui')
      fetchTasks(debouncedSearch)
      setDrawerOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.meta?.message || 'Gagal menyimpan task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!taskId) {
      toast.error('ID task tidak ditemukan')
      return
    }

    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task berhasil dihapus')
      fetchTasks(debouncedSearch)
      setDrawerOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.meta?.message || 'Gagal menghapus task')
    }
  }

  const moveTask = async (taskId, status) => {
    if (!taskId || !status) {
      toast.error('Data status tidak valid')
      return
    }

    setTasks(current => current.map(t => t.id === taskId ? { ...t, status } : t))
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      toast.success('Status task berhasil diubah')
    } catch (err) {
      toast.error(err.response?.data?.meta?.message || 'Gagal mengupdate status')
      fetchTasks(debouncedSearch)
    }
  }

  return (
    <AppLayout active="My Task">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            My Task
          </p>
          <h1 className="mt-2 text-3xl font-black text-brand-navy md:text-4xl">
            Kelola tugasmu
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{user?.name}</p>
        </div>

        <button
          type="button"
          onClick={() => openCreateDrawer('belum')}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
        >
          <Plus className="h-4 w-4" />
          Tambah task
        </button>
      </section>

      <section className="relative z-20 mb-6 overflow-visible rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px_280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari judul, project, label, atau PIC"
              className="min-h-[72px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <FilterDropdown
            label="Kategori task"
            options={taskCategoryOptions}
            values={selectedScopes}
            multiple
            allLabel="Semua kategori"
            minSelectedCount={1}
            onSelectAll={() => setSelectedScopes(allScopeValues)}
            onToggleOption={(value) => toggleOption(value, setSelectedScopes)}
          />

          <FilterDropdown
            label="Prioritas"
            options={priorityOptions}
            values={selectedPriorities}
            multiple
            allLabel="Semua prioritas"
            minSelectedCount={1}
            onSelectAll={() => setSelectedPriorities(allPriorityValues)}
            onToggleOption={(value) => toggleOption(value, setSelectedPriorities)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {loading ? (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              Loading...
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {filteredTasks.length} dari {tasks.length} task tampil
            </span>
          )}
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
            {personalTasksCount} task pribadi
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            {projectTasksCount} task project
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {doneTasksCount} task selesai
          </span>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <X className="h-3.5 w-3.5" />
              Reset filter
            </button>
          ) : null}
        </div>
      </section>

      <TaskBoard
        tasks={filteredTasks}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onCreateTask={openCreateDrawer}
        onOpenTask={openTaskDrawer}
        onMoveTask={moveTask}
        actionLabel="Tambah task"
        showHeader={false}
        showSearch={false}
        showActionButton={false}
        showColumnAddButton={false}
      />

      {drawerOpen ? (
        <Suspense fallback={null}>
          <TaskDrawer
            key={`${drawerMode}-${activeTask?.id ?? createStatus}-${drawerOpen ? 'open' : 'closed'}`}
            open={drawerOpen}
            mode={drawerMode}
            task={activeTask}
            onClose={closeDrawer}
            onSave={saveTask}
            onDelete={deleteTask}
            projects={projects}
            scopeMode={
              drawerMode === 'create'
                ? 'personalOnly'
                : activeTask?.scope === 'project'
                  ? 'projectOnly'
                  : 'personalOnly'
            }
            lockAssignee
            lockedProjectId={activeTask?.projectId ?? ''}
          />
        </Suspense>
      ) : null}
    </AppLayout>
  )
}
