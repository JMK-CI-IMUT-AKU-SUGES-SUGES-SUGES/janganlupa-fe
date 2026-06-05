import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, FolderOpen, Plus, Search, Users } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import FilterDropdown from '../components/FilterDropdown'
import ProjectEditorDrawer from '../components/ProjectEditorDrawer'
import useWorkspace from '../hooks/useWorkspace'
import {
  getInitials,
  getProjectPeople,
  getProjectRole,
  getProjectTaskStats,
  projectRoleMeta,
} from '../lib/projectUtils'

const roleFilterOptions = [
  { value: 'all', label: 'Semua akses' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Anggota' },
]

function createProjectDraft(ownerName) {
  return {
    id: `project-${Date.now()}`,
    name: '',
    description: '',
    owner: ownerName,
    admins: [],
    members: [],
    progress: 0,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    links: [],
    comments: [],
  }
}

export default function Project() {
  const navigate = useNavigate()
  const { currentUser, projects, tasks, updateProject } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return projects.filter((project) => {
      const role = getProjectRole(project, currentUser.name)
      const searchableText = [
        project.name,
        project.description,
        project.owner,
        ...project.admins,
        ...project.members,
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery = searchableText.includes(normalizedQuery)
      const matchesRole = roleFilter === 'all' || role === roleFilter

      return matchesQuery && matchesRole
    })
  }, [currentUser.name, projects, roleFilter, searchQuery])

  const totalProjectTasks = tasks.filter((task) => task.scope === 'project').length

  const handleCreateProject = (projectInput) => {
    updateProject(projectInput)
    setDrawerOpen(false)
    navigate(`/projects/${projectInput.id}`)
  }

  return (
    <AppLayout active="Projects">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-black text-brand-navy md:text-4xl">
            Ruang project
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {projects.length} project aktif
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
            {totalProjectTasks} task project
          </span>
        </div>
      </section>

      <section className="relative z-20 mb-6 overflow-visible rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari nama project, owner, admin, atau partner"
              className="min-h-[72px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <FilterDropdown
            label="Filter role"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            emptyLabel="Pilih role"
          />

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-[72px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
          >
            <Plus className="h-4 w-4" />
            Tambah project
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {filteredProjects.length} dari {projects.length} project tampil
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
            {roleFilterOptions.find((option) => option.value === roleFilter)?.label}
          </span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {filteredProjects.map((project) => {
          const role = getProjectRole(project, currentUser.name)
          const roleMeta = projectRoleMeta[role]
          const people = getProjectPeople(project)
          const taskStats = getProjectTaskStats(tasks, project.id, project.progress)

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:border-brand/20 hover:shadow-2xl hover:shadow-brand/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand">
                      {project.name}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${roleMeta.tone}`}
                    >
                      {roleMeta.label}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-lg font-black text-brand-navy">
                    {project.description}
                  </p>
                </div>

                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-brand">
                  <FolderOpen className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {taskStats.total} task
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
                  {taskStats.progress}% progress
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {taskStats.done} selesai
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {people.slice(0, 4).map((person) => (
                      <div
                        key={`${project.id}-${person.role}-${person.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#001529_0%,#0052cc_100%)] text-xs font-black text-white shadow-sm"
                        title={person.name}
                      >
                        {getInitials(person.name)}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-brand-navy">
                      <Users className="h-4 w-4 text-brand" />
                      {people.length} partner
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      {project.owner} · {project.admins.length} admin
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand transition group-hover:translate-x-0.5 group-hover:text-brand-navy">
                  Buka
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          )
        })}
      </section>

      <ProjectEditorDrawer
        key={`create-project-${drawerOpen ? 'open' : 'closed'}`}
        mode="create"
        open={drawerOpen}
        project={createProjectDraft(currentUser.name)}
        currentUserName={currentUser.name}
        onClose={() => setDrawerOpen(false)}
        onSave={handleCreateProject}
      />
    </AppLayout>
  )
}
