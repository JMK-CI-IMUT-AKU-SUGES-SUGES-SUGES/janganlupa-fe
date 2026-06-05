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
