export const projectRoleMeta = {
  owner: {
    label: 'Owner',
    tone: 'bg-amber-100 text-amber-700',
  },
  admin: {
    label: 'Admin',
    tone: 'bg-blue-100 text-brand',
  },
  member: {
    label: 'Anggota',
    tone: 'bg-slate-100 text-slate-600',
  },
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('')
}

export function getAvatarDataUri(name = 'User') {
  const initials = getInitials(name) || 'U'
  const palettes = [
    { start: '#001529', end: '#0052cc', accent: '#14b8a6' },
    { start: '#1e3a8a', end: '#2563eb', accent: '#38bdf8' },
    { start: '#4c1d95', end: '#7c3aed', accent: '#c084fc' },
    { start: '#0f766e', end: '#14b8a6', accent: '#67e8f9' },
  ]

  const hash = Array.from(name || initials).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  )
  const palette = palettes[hash % palettes.length]

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="70%" stop-color="${palette.end}" />
          <stop offset="100%" stop-color="${palette.accent}" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#avatarGradient)" />
      <circle cx="76" cy="20" r="10" fill="rgba(255,255,255,0.18)" />
      <text
        x="50%"
        y="54%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="32"
        font-weight="700"
        fill="#ffffff"
      >${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function getProjectRole(project, userName) {
  if (!project || !userName) return 'member'
  if (project.owner === userName) return 'owner'
  if (project.admins.includes(userName)) return 'admin'
  return 'member'
}

export function getProjectPeople(project) {
  if (!project) return []

  const peopleMap = new Map()

  const upsertPerson = (name, role) => {
    if (!name) return

    const previous = peopleMap.get(name)
    if (!previous) {
      peopleMap.set(name, { name, role })
      return
    }

    const priority = { owner: 3, admin: 2, member: 1 }
    if (priority[role] > priority[previous.role]) {
      peopleMap.set(name, { name, role })
    }
  }

  upsertPerson(project.owner, 'owner')
  project.admins.forEach((name) => upsertPerson(name, 'admin'))
  project.members.forEach((name) => upsertPerson(name, 'member'))

  return Array.from(peopleMap.values())
}

export function getProjectTaskStats(tasks, projectId, fallbackProgress = 0) {
  const projectTasks = tasks.filter(
    (task) => task.scope === 'project' && task.projectId === projectId
  )

  const total = projectTasks.length
  const done = projectTasks.filter((task) => task.status === 'selesai').length
  const active = projectTasks.filter((task) => task.status === 'berjalan').length
  const backlog = projectTasks.filter((task) => task.status === 'belum').length
  const progress = total
    ? Math.round(
        projectTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / total
      )
    : fallbackProgress

  return {
    total,
    done,
    active,
    backlog,
    progress,
  }
}

export function normalizeProject(apiProject) {
  const users = apiProject.users || []
  const owner = users.find((u) => u.pivot?.role === 'owner')?.name || ''
  const admins = users.filter((u) => u.pivot?.role === 'admin').map((u) => u.name)
  const members = users.filter((u) => u.pivot?.role === 'member').map((u) => u.name)

  return {
    id: apiProject.id,
    name: apiProject.name || '',
    description: apiProject.description || '',
    deadline: apiProject.deadline_date || '',
    owner,
    admins,
    members,
    users,
    links: (apiProject.links || []).map((link) => ({
      id: link.id || `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: link.label || '',
      url: link.url || '',
    })),
    progress: apiProject.progress || 0,
    active_tasks_count: apiProject.active_tasks_count || 0,
  }
}

export function normalizeTask(apiTask, userName) {
  const assigneeObj = apiTask.assignee
  const projectObj = apiTask.project
  const hasProject = Boolean(apiTask.project_id)

  return {
    id: apiTask.id,
    title: apiTask.title || '',
    description: apiTask.description || '',
    status: apiTask.status || 'belum',
    priority: apiTask.priority || 'sedang',
    label: apiTask.label || '',
    dueDate: apiTask.due_date || '',
    progress: apiTask.progress ?? 0,
    assigneeId: apiTask.assignee_user_id || assigneeObj?.id || '',
    assignee: assigneeObj?.name || userName || '',
    scope: hasProject ? 'project' : 'personal',
    projectId: apiTask.project_id || '',
    projectName: projectObj?.name || '',
    links: (apiTask.links || []).map((link) => ({
      id: link.id || `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: link.label || '',
      url: link.url || '',
    })),
  }
}

export function denormalizeTask(task) {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate || null,
    project_id: task.scope === 'project' ? task.projectId : null,
    assignee_user_id: task.scope === 'project' ? task.assigneeId || null : null,
    label: task.label,
    progress: task.progress ?? 0,
    links: (task.links || []).map((link) => ({
      label: link.label || '',
      url: link.url || '',
    })),
  }
}
