import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import TaskBoard from '../components/TaskBoard'
import TaskDrawer from '../components/TaskDrawer'
import useWorkspace from '../hooks/useWorkspace'
import { createTaskDraft } from '../lib/taskBoard'

const taskCategoryOptions = [
  { value: 'personal', label: 'Task pribadi' },
  { value: 'project', label: 'Task project' },
]

const priorityOptions = [
  { value: 'Tinggi', label: 'Prioritas tinggi' },
  { value: 'Sedang', label: 'Prioritas sedang' },
  { value: 'Rendah', label: 'Prioritas rendah' },
]

const allScopeValues = taskCategoryOptions.map((option) => option.value)
const allPriorityValues = priorityOptions.map((option) => option.value)

export default function TaskList() {
  const {
    createTask,
    currentUser,
    deleteTask,
    moveTask,
    projects,
    tasks,
    updateTask,
  } = useWorkspace()
  const location = useLocation()
  const shouldOpenCreate = Boolean(location.state?.openCreateTask)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedScopes, setSelectedScopes] = useState(allScopeValues)
  const [selectedPriorities, setSelectedPriorities] = useState(allPriorityValues)
  const [drawerOpen, setDrawerOpen] = useState(shouldOpenCreate)
  const [drawerMode, setDrawerMode] = useState(shouldOpenCreate ? 'create' : 'edit')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [createStatus, setCreateStatus] = useState('belum')

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assignee === currentUser.name),
    [currentUser.name, tasks]
  )

  const personalTasksCount = useMemo(
    () => myTasks.filter((task) => task.scope === 'personal').length,
    [myTasks]
  )

  const projectTasksCount = useMemo(
    () => myTasks.filter((task) => task.scope === 'project').length,
    [myTasks]
  )

  const doneTasksCount = useMemo(
    () => myTasks.filter((task) => task.status === 'selesai').length,
    [myTasks]
  )

  const filteredTasks = useMemo(
    () =>
      myTasks.filter((task) => {
        const searchableText = [
          task.title,
          task.description,
          task.projectName,
          task.assignee,
          task.label,
        ]
          .join(' ')
          .toLowerCase()

        const matchesSearch = searchableText.includes(normalizedSearchQuery)
        const matchesScope = selectedScopes.includes(task.scope)
        const matchesPriority = selectedPriorities.includes(task.priority)

        return matchesSearch && matchesScope && matchesPriority
      }),
    [myTasks, normalizedSearchQuery, selectedPriorities, selectedScopes]
  )

  const hasActiveFilters =
    normalizedSearchQuery.length > 0 ||
    selectedScopes.length !== taskCategoryOptions.length ||
    selectedPriorities.length !== priorityOptions.length

  const activeTask = useMemo(
    () =>
      drawerMode === 'edit'
        ? tasks.find((task) => task.id === activeTaskId) ?? null
        : createTaskDraft({
            assignee: currentUser.name,
            status: createStatus,
            dueDate: new Date().toISOString().slice(0, 10),
            scope: 'personal',
          }),
    [activeTaskId, createStatus, currentUser.name, drawerMode, tasks]
  )

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

  const saveTask = useCallback((task) => {
    if (drawerMode === 'create') {
      createTask({
        ...task,
        assignee: currentUser.name,
        scope: 'personal',
        projectId: '',
        projectName: '',
      })
    } else {
      updateTask({
        ...task,
        assignee: currentUser.name,
      })
    }

    setDrawerOpen(false)
  }, [createTask, currentUser.name, drawerMode, updateTask])

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
          <p className="mt-2 text-sm font-medium text-slate-500">{currentUser.name}</p>
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
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {filteredTasks.length} dari {myTasks.length} task tampil
          </span>
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
    </AppLayout>
  )
}
