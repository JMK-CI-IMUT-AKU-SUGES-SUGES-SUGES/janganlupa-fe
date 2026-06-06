import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
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
  UserPlus,
  X,
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import TaskBoard from '../components/TaskBoard'
import GlobalModal from '../components/GlobalModal'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  getInitials,
  getProjectPeople,
  getProjectRole,
  getProjectTaskStats,
  normalizeProject,
  normalizeTask,
  denormalizeTask,
  projectRoleMeta,
} from '../lib/projectUtils'
import { taskStatusOptions } from '../lib/taskBoard'
import { taskSchema, projectSchema, inviteMemberSchema, formatZodErrors } from '../lib/validation'
import { useProject, useInvalidate } from '../lib/queries'

const TaskDrawer = lazy(() => import('../components/TaskDrawer'))
const ProjectEditorDrawer = lazy(() => import('../components/ProjectEditorDrawer'))

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
  const { user } = useAuth()
  const invalidate = useInvalidate()

  const projectQuery = useProject(projectId)

  const loading = projectQuery.isLoading
  const project = useMemo(() => {
    return projectQuery.data ? normalizeProject(projectQuery.data) : null
  }, [projectQuery.data])

  const tasks = useMemo(() => {
    return (projectQuery.data?.tasks || []).map((t) => normalizeTask(t, user?.name))
  }, [projectQuery.data?.tasks, user?.name])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('edit')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [createStatus, setCreateStatus] = useState('belum')
  const [editorOpen, setEditorOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSlug, setInviteSlug] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [error, setError] = useState('')
  const [inviteError, setInviteError] = useState('')

  const role = project ? getProjectRole(project, user.name) : 'member'
  const roleMeta = projectRoleMeta[role]
  const people = project ? getProjectPeople(project) : []
  const taskStats = project ? getProjectTaskStats(tasks, project.id, project.progress) : { total: 0, done: 0, active: 0, backlog: 0, progress: 0 }
  const canEditProject = role === 'owner'
  const canManageTasks = role === 'owner' || role === 'admin'
  const canManageMembers = role === 'owner' || role === 'admin'
  const maxTaskDueDate = project ? getDayBefore(project.deadline) : ''
  const assigneeOptions = useMemo(
    () =>
      (project?.users || []).map((member) => ({
        value: member.id,
        label: member.name,
      })),
    [project?.users]
  )

  const projectTasks = tasks

  const assigneeNames = Array.from(
    new Set(projectTasks.map((task) => task.assignee).filter(Boolean))
  )
  const assigneeFilterOptions = [
    { value: 'all', label: 'Semua anggota' },
    ...assigneeNames.map((assignee) => ({ value: assignee, label: assignee })),
  ]
  const statusFilterOptions = [
    { value: 'all', label: 'Semua status' },
    ...taskStatusOptions,
  ]

  const filteredTasks = projectTasks.filter((task) => {
    const searchableText = [task.title, task.description, task.projectName, task.assignee, task.label]
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(searchQuery.trim().toLowerCase())
    const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus

    return matchesSearch && matchesAssignee && matchesStatus
  })

  const activeTask = useMemo(() => {
    if (drawerMode === 'edit') {
      return tasks.find((task) => task.id === activeTaskId) ?? null
    }
    return {
      title: '',
      description: '',
      assigneeId: user.id,
      assignee: user.name,
      status: createStatus,
      dueDate: maxTaskDueDate || new Date().toISOString().slice(0, 10),
      scope: 'project',
      projectId: project?.id || '',
      projectName: project?.name || '',
      priority: 'sedang',
      label: 'Frontend',
      progress: 0,
      links: [],
    }
  }, [activeTaskId, createStatus, drawerMode, maxTaskDueDate, project, tasks, user.id, user.name])

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

  const saveTask = async (taskData) => {
    setError('')

    const result = taskSchema.safeParse(taskData)
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    try {
      const payload = denormalizeTask(taskData)

      if (drawerMode === 'create') {
        await api.post('/tasks', payload)
      } else {
        await api.put(`/tasks/${taskData.id}`, payload)
      }

      invalidate(['project', projectId], 'tasks')
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
      invalidate(['project', projectId], 'tasks')
      setDrawerOpen(false)
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal menghapus task')
    }
  }

  const moveTask = async (taskId, status) => {
    setError('')

    if (!taskId || !status) {
      setError('Data status tidak valid')
      return
    }

    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, status } : t))
    )
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal mengupdate status')
      fetchProject()
    }
  }

  const saveProject = async (nextProject) => {
    setError('')

    const result = projectSchema.safeParse(nextProject)
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    try {
      const payload = {
        name: nextProject.name,
        description: nextProject.description,
        deadline_date: nextProject.deadline || null,
        links: (nextProject.links || []).map((link) => ({
          label: link.label,
          url: link.url,
        })),
      }

      await api.put(`/projects/${project.id}`, payload)
      fetchProject()
      setEditorOpen(false)
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal menyimpan project')
    }
  }

  const handleInvite = async (event) => {
    event.preventDefault()
    setInviteError('')

    const result = inviteMemberSchema.safeParse({
      slug: inviteSlug.trim(),
      role: inviteRole,
    })
    if (!result.success) {
      setInviteError(formatZodErrors(result.error))
      return
    }

    try {
      await api.post(`/projects/${project.id}/members`, {
        slug: inviteSlug.trim(),
        role: inviteRole,
      })
      setInviteOpen(false)
      setInviteSlug('')
      setInviteRole('member')
      fetchProject()
    } catch (err) {
      const message = err.response?.data?.meta?.message || ''
      const errors = err.response?.data?.data || {}

      if (errors.slug) {
        setInviteError(errors.slug[0] || 'Slug tidak ditemukan')
      } else if (message) {
        setInviteError(message)
      } else {
        setInviteError('Gagal mengundang member')
      }
    }
  }

  const removeMember = async (userId) => {
    setError('')

    if (!userId) {
      setError('ID member tidak valid')
      return
    }

    try {
      await api.delete(`/projects/${project.id}/members/${userId}`)
      fetchProject()
    } catch (err) {
      setError(err.response?.data?.meta?.message || 'Gagal menghapus member')
    }
  }

  if (loading) {
    return (
      <AppLayout active="Projects">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm font-bold text-slate-500">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <AppLayout active="Projects">
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {error}
        </div>
      ) : null}
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

        <div className="flex flex-wrap gap-2">
          {canManageMembers ? (
            <button
              type="button"
              onClick={() => { setInviteError(''); setInviteOpen(true) }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand/20 bg-blue-50 px-5 py-3 text-sm font-bold text-brand transition hover:-translate-y-0.5 hover:bg-brand hover:text-white"
            >
              <UserPlus className="h-4 w-4" />
              Undang member
            </button>
          ) : null}
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
        </div>
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
            {people.map((person) => {
              const userObj = project.users?.find((u) => u.name === person.name)

              return (
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
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${projectRoleMeta[person.role].tone}`}
                    >
                      {projectRoleMeta[person.role].label}
                    </span>
                    {canManageMembers && person.role !== 'owner' && userObj ? (
                      <button
                        type="button"
                        onClick={() => removeMember(userObj.id)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-rose-50 p-1.5 text-rose-500 transition hover:bg-rose-100"
                        title="Hapus member"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
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
              : statusFilterOptions.find((s) => s.value === selectedStatus)?.label}
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

      {drawerOpen ? (
        <Suspense fallback={null}>
          <TaskDrawer
            key={`${drawerMode}-${activeTask?.id ?? project.id}-${createStatus}`}
            open={drawerOpen}
            mode={drawerMode}
            task={activeTask}
            onClose={closeTaskDrawer}
            onSave={saveTask}
            onDelete={deleteTask}
            projects={[project]}
            assigneeOptions={assigneeOptions}
            scopeMode="projectOnly"
            lockedProjectId={project.id}
            maxDueDate={maxTaskDueDate}
          />
        </Suspense>
      ) : null}

      {editorOpen ? (
        <Suspense fallback={null}>
          <ProjectEditorDrawer
            key={`${project.id}-${editorOpen ? 'open' : 'closed'}`}
            open={editorOpen}
            project={project}
            currentUserName={user.name}
            onClose={() => setEditorOpen(false)}
            onSave={saveProject}
          />
        </Suspense>
      ) : null}

      <GlobalModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      >
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Project
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-navy">Undang member</h2>
            <p className="mt-1 text-sm text-slate-500">
              Masukkan slug partner untuk menambahkan ke project ini
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Slug partner
              </span>
              <input
                value={inviteSlug}
                onChange={(e) => setInviteSlug(e.target.value)}
                placeholder="@username"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Peran
              </span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              >
                <option value="member">Anggota</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {inviteError ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {inviteError}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
              >
                <UserPlus className="h-4 w-4" />
                Undang
              </button>
            </div>
          </form>
        </div>
      </GlobalModal>
    </AppLayout>
  )
}
