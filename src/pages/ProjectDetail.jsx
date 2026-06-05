import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Link2,
  PencilLine,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import TaskBoard from '../components/TaskBoard'
import TaskDrawer from '../components/TaskDrawer'
import ProjectEditorDrawer from '../components/ProjectEditorDrawer'
import useWorkspace from '../hooks/useWorkspace'
import { createTaskDraft, taskStatusOptions } from '../lib/taskBoard'
import {
  getInitials,
  getProjectPeople,
  getProjectRole,
  getProjectTaskStats,
  projectRoleMeta,
} from '../lib/projectUtils'

function getDayBefore(dateValue) {
  if (!dateValue) return ''
  const nextDate = new Date(`${dateValue}T00:00:00`)
  nextDate.setDate(nextDate.getDate() - 1)
  return nextDate.toISOString().slice(0, 10)
}

function formatCompactDate(dateValue) {
  if (!dateValue) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const {
    createTask,
    currentUser,
    deleteTask,
    moveTask,
    projects,
    tasks,
    updateProject,
    updateTask,
  } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('edit')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [createStatus, setCreateStatus] = useState('belum')
  const [editorOpen, setEditorOpen] = useState(false)

  const project = projects.find((item) => item.id === projectId)

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const role = getProjectRole(project, currentUser.name)
  const roleMeta = projectRoleMeta[role]
  const people = getProjectPeople(project)
  const taskStats = getProjectTaskStats(tasks, project.id, project.progress)
  const canEditProject = role === 'owner'
  const canManageTasks = role === 'owner' || role === 'admin'
  const maxTaskDueDate = getDayBefore(project.deadline)

  const projectTasks = tasks.filter(
    (task) => task.scope === 'project' && task.projectId === project.id
  )

  const assigneeOptions = Array.from(
    new Set(projectTasks.map((task) => task.assignee).filter(Boolean))
  )
  const assigneeFilterOptions = [
    { value: 'all', label: 'Semua anggota' },
    ...assigneeOptions.map((assignee) => ({ value: assignee, label: assignee })),
  ]
  const statusFilterOptions = [
    { value: 'all', label: 'Semua status' },
    ...taskStatusOptions,
  ]

  const filteredTasks = projectTasks.filter((task) => {
    const searchableText = [
      task.title,
      task.description,
      task.projectName,
      task.assignee,
      task.label,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(searchQuery.trim().toLowerCase())
    const matchesAssignee =
      selectedAssignee === 'all' || task.assignee === selectedAssignee
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus

    return matchesSearch && matchesAssignee && matchesStatus
  })

  const activeTask =
    drawerMode === 'edit'
      ? tasks.find((task) => task.id === activeTaskId) ?? null
      : createTaskDraft({
          scope: 'project',
          projectId: project.id,
          projectName: project.name,
          status: createStatus,
          dueDate: maxTaskDueDate || new Date().toISOString().slice(0, 10),
        })

  const openCreateDrawer = (status = 'belum') => {
    if (!canManageTasks) return

    setCreateStatus(status)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const openTaskDrawer = (taskId) => {
    if (!canManageTasks) return

    setActiveTaskId(taskId)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const closeTaskDrawer = () => {
    setDrawerOpen(false)
  }

  const saveTask = (task) => {
    if (drawerMode === 'create') {
      createTask({
        ...task,
        scope: 'project',
        projectId: project.id,
        projectName: project.name,
      })
    } else {
      updateTask({
        ...task,
        scope: 'project',
        projectId: project.id,
        projectName: project.name,
      })
    }

    setDrawerOpen(false)
  }

  const saveProject = (nextProject) => {
    updateProject(nextProject)
    setEditorOpen(false)
  }

  return (
    <AppLayout active="Projects">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand/20 hover:bg-blue-50 hover:text-brand"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Project Detail
            </p>
            <h1 className="mt-1 text-3xl font-black text-brand-navy">{project.name}</h1>
          </div>
        </div>

        {canEditProject ? (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
          >
            <PencilLine className="h-4 w-4" />
            Edit project
          </button>
        ) : null}
      </section>

      <section className="mb-6 overflow-hidden rounded-[32px] border border-brand/10 bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] p-6 text-white shadow-2xl shadow-brand/10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleMeta.tone}`}>
                {roleMeta.label}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {taskStats.total} task
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {taskStats.progress}% progress
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatCompactDate(project.deadline)}
              </span>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cyan-50/90">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {people.slice(0, 5).map((person) => (
                <div
                  key={`${person.role}-${person.name}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-brand shadow-sm">
                    {getInitials(person.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{person.name}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                      {projectRoleMeta[person.role].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-md xl:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Belum selesai
              </p>
              <p className="mt-2 text-3xl font-black">{taskStats.backlog}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Berjalan
              </p>
              <p className="mt-2 text-3xl font-black">{taskStats.active}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Selesai
              </p>
              <p className="mt-2 text-3xl font-black">{taskStats.done}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
            <Link2 className="h-4 w-4" />
            Link project
          </div>

          <div className="mt-5 space-y-3">
            {(project.links?.length ?? 0) > 0 ? (
              project.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:border-brand/20 hover:bg-blue-50/70"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brand-navy">
                      {link.label || 'Link tanpa keterangan'}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {link.url || 'Belum ada URL'}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                Belum ada link project.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
            <Users className="h-4 w-4" />
            Partner project
          </div>

          <div className="mt-5 space-y-3">
            {people.map((person) => (
              <div
                key={`${person.role}-${person.name}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-brand shadow-sm">
                    {getInitials(person.name)}
                  </span>
                  <p className="truncate font-bold text-brand-navy">{person.name}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${projectRoleMeta[person.role].tone}`}
                >
                  {projectRoleMeta[person.role].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 overflow-visible rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Task Project
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-navy">Board task</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari task atau PIC"
                className="min-h-[72px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <div className="sm:min-w-[220px]">
              <FilterDropdown
                label="Anggota"
                options={assigneeFilterOptions}
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                emptyLabel="Pilih anggota"
              />
            </div>

            <div className="sm:min-w-[220px]">
              <FilterDropdown
                label="Status"
                options={statusFilterOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                emptyLabel="Pilih status"
              />
            </div>

            {canManageTasks ? (
              <button
                type="button"
                onClick={() => openCreateDrawer('belum')}
                className="inline-flex min-h-[72px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
              >
                <Plus className="h-4 w-4" />
                Tambah task
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {filteredTasks.length} dari {projectTasks.length} task tampil
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
            {taskStats.active} task berjalan
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {taskStats.done} task selesai
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {selectedAssignee === 'all' ? 'Semua anggota' : selectedAssignee}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {selectedStatus === 'all'
              ? 'Semua status'
              : statusFilterOptions.find((status) => status.value === selectedStatus)?.label}
          </span>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${roleMeta.tone}`}>
            {roleMeta.label}
          </span>
        </div>

        <TaskBoard
          tasks={filteredTasks}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onCreateTask={openCreateDrawer}
          onOpenTask={openTaskDrawer}
          onMoveTask={moveTask}
          showHeader={false}
          showSearch={false}
          showActionButton={false}
          showColumnAddButton={false}
          canManageTasks={canManageTasks}
          canOpenTask={canManageTasks}
          emptyState="Belum ada task project"
        />
      </section>

      <TaskDrawer
        key={`${drawerMode}-${activeTask?.id ?? project.id}-${createStatus}`}
        open={drawerOpen}
        mode={drawerMode}
        task={activeTask}
        onClose={closeTaskDrawer}
        onSave={saveTask}
        onDelete={deleteTask}
        projects={projects}
        scopeMode="projectOnly"
        lockedProjectId={project.id}
        maxDueDate={maxTaskDueDate}
      />

      <ProjectEditorDrawer
        key={`${project.id}-${editorOpen ? 'open' : 'closed'}`}
        open={editorOpen}
        project={project}
        currentUserName={currentUser.name}
        onClose={() => setEditorOpen(false)}
        onSave={saveProject}
      />
    </AppLayout>
  )
}
