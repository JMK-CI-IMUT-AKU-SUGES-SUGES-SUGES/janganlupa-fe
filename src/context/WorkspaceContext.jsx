import { useEffect, useState } from 'react'
import {
  createTaskDraft,
  createTaskLinkDraft,
  moveTaskInArray,
  normalizeTaskLinks,
  normalizeTaskProgress,
} from '../lib/taskBoard'
import WorkspaceContext from './workspaceContext'

const storageKey = 'janganlupa.workspace'

const defaultCurrentUser = {
  id: 'JL-2049',
  name: 'Narendra',
  slug: '@narendra.dev',
  email: 'ardhivaputran@gmail.com',
  role: 'Pengguna aktif',
  focus: 'Produktivitas harian',
  timezone: 'WIB',
  status: 'Aktif',
}

function normalizeSlug(slug = '') {
  const cleanedSlug = slug.trim().replace(/\s+/g, '')
  if (!cleanedSlug) return ''
  return cleanedSlug.startsWith('@')
    ? cleanedSlug.toLowerCase()
    : `@${cleanedSlug.toLowerCase()}`
}

function getPartnerNameFromSlug(slug = '') {
  const cleanedSlug = slug.replace(/^@/, '').trim()
  if (!cleanedSlug) return 'Partner baru'

  return cleanedSlug
    .split(/[._-]/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function normalizeCurrentUser(user = {}) {
  const nextName = user.name?.trim() || defaultCurrentUser.name
  const nextSlug = normalizeSlug(
    user.slug || `@${nextName.toLowerCase().replace(/\s+/g, '')}`
  )

  return {
    id: user.id?.trim() || defaultCurrentUser.id,
    name: nextName,
    slug: nextSlug || defaultCurrentUser.slug,
    email: user.email?.trim() || defaultCurrentUser.email,
    role: user.role?.trim() || defaultCurrentUser.role,
    focus: user.focus?.trim() || defaultCurrentUser.focus,
    timezone: user.timezone?.trim() || defaultCurrentUser.timezone,
    status: user.status?.trim() || defaultCurrentUser.status,
  }
}

function addDaysToDate(dateValue, days) {
  const nextDate = new Date(`${dateValue}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

function getDefaultProjectDeadline() {
  return addDaysToDate(new Date().toISOString().slice(0, 10), 14)
}

const projectSeed = [
  {
    id: 'project-jlf',
    name: 'JanganLupa FE',
    description: 'Perapihan dashboard, auth, dan alur task utama.',
    owner: 'Narendra',
    admins: ['Rafi'],
    members: ['Alya', 'Bimo'],
    progress: 78,
    deadline: '2026-06-12',
    links: [
      createTaskLinkDraft({
        label: 'Figma board',
        url: 'https://figma.com/file/janganlupa-fe',
      }),
      createTaskLinkDraft({
        label: 'Deploy preview',
        url: 'https://preview.janganlupa.app',
      }),
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Alya',
        text: 'Board task user sudah rapi, tinggal sinkronkan flag project di My Task.',
      },
      {
        id: 'comment-2',
        author: 'Narendra',
        text: 'Quick add dashboard perlu tetap ringan supaya cocok untuk capture task cepat.',
      },
    ],
  },
  {
    id: 'project-pbl',
    name: 'PBL Workspace',
    description: 'Setup FE, BE, dan UI/UX untuk workspace project kampus.',
    owner: 'Narendra',
    admins: ['Rafi'],
    members: ['Alya', 'Dimas'],
    progress: 46,
    deadline: '2026-06-15',
    links: [
      createTaskLinkDraft({
        label: 'Notion sprint',
        url: 'https://notion.so/pbl-workspace-sprint',
      }),
    ],
    comments: [
      {
        id: 'comment-3',
        author: 'Rafi',
        text: 'Board project lebih enak kalau task penting tetap kebaca cepat dari card list.',
      },
      {
        id: 'comment-4',
        author: 'Alya',
        text: 'Komentar project akan enak kalau bisa thread per task di iterasi berikutnya.',
      },
    ],
  },
]

const partnerSeed = [
  {
    id: 'partner-1',
    name: 'Rafi Ananta',
    slug: '@rafiux',
    status: 'Terhubung',
    direction: 'connected',
    note: 'Aktif di project PBL Workspace',
  },
  {
    id: 'partner-2',
    name: 'Alya Putri',
    slug: '@alyapm',
    status: 'Terhubung',
    direction: 'connected',
    note: 'Sudah aktif di project JanganLupa FE',
  },
  {
    id: 'partner-3',
    name: 'Bimo Satria',
    slug: '@bimosync',
    status: 'Menunggu',
    direction: 'outgoing',
    note: 'Menunggu konfirmasi partner',
  },
  {
    id: 'partner-4',
    name: 'Dimas Saputra',
    slug: '@dimasflow',
    status: 'Perlu ditinjau',
    direction: 'incoming',
    note: 'Ingin terhubung ke workspace kamu',
  },
]

function normalizePartnerRequest(request) {
  const slug = normalizeSlug(request.slug)
  const direction =
    request.direction ||
    (request.status === 'Terhubung'
      ? 'connected'
      : request.status === 'Perlu ditinjau'
        ? 'incoming'
        : 'outgoing')

  return {
    id: request.id?.trim?.() || `partner-${Date.now()}`,
    name: request.name?.trim() || getPartnerNameFromSlug(slug),
    slug,
    status: request.status?.trim?.() || 'Menunggu',
    direction,
    note: request.note?.trim?.() || '',
  }
}

function getPartnerConnectedNote(name) {
  return `${name} sudah terhubung ke workspace kamu`
}

function normalizeNameList(list = []) {
  return Array.from(
    new Set(
      list
        .map((item) => item?.trim?.() ?? '')
        .filter(Boolean)
    )
  )
}

function normalizeProject(project, currentUserName = defaultCurrentUser.name) {
  const owner = project.owner?.trim() || currentUserName
  const admins = normalizeNameList(project.admins).filter((name) => name !== owner)
  const members = normalizeNameList(project.members).filter(
    (name) => name !== owner && !admins.includes(name)
  )

  return {
    id: project.id?.trim() || `project-${Date.now()}`,
    name: project.name?.trim() || 'Project baru',
    description: project.description?.trim() || 'Belum ada deskripsi.',
    owner,
    admins,
    members,
    progress: Math.min(100, Math.max(0, Number(project.progress) || 0)),
    deadline: project.deadline?.trim?.() || '',
    links: normalizeTaskLinks(project.links),
    comments: Array.isArray(project.comments)
      ? project.comments.map((comment, index) => ({
          id: comment.id ?? `comment-${index + 1}`,
          author: comment.author?.trim() || owner,
          text: comment.text?.trim() || '',
        }))
      : [],
  }
}

function ensureProjectDeadlines(projects, tasksSource = []) {
  return projects.map((project) => {
    if (project.deadline) return project

    const relatedDueDates = tasksSource
      .filter((task) => task.projectId === project.id && task.dueDate)
      .map((task) => task.dueDate)
      .sort()

    const derivedDeadline = relatedDueDates.length
      ? addDaysToDate(relatedDueDates.at(-1), 1)
      : getDefaultProjectDeadline()

    return {
      ...project,
      deadline: derivedDeadline,
    }
  })
}

const defaultProjects = ensureProjectDeadlines(
  projectSeed.map((project) => normalizeProject(project, defaultCurrentUser.name)),
  projectSeed
)
const defaultPartnerRequests = partnerSeed.map((request) => normalizePartnerRequest(request))

function normalizeTask(
  task,
  relatedProjects = defaultProjects,
  currentUserName = defaultCurrentUser.name
) {
  const baseTask = createTaskDraft()
  const relatedProject = relatedProjects.find((project) => project.id === task.projectId)
  const isProjectTask = (task.scope === 'project' || Boolean(task.projectId)) && relatedProject

  return {
    ...baseTask,
    ...task,
    assignee: task.assignee?.trim() || currentUserName,
    title: task.title?.trim() || 'Tugas tanpa judul',
    description: task.description?.trim() || 'Belum ada deskripsi.',
    progress: normalizeTaskProgress(task.progress, task.status),
    links: normalizeTaskLinks(task.links),
    scope: isProjectTask ? 'project' : 'personal',
    projectId: isProjectTask ? relatedProject.id : '',
    projectName: isProjectTask ? relatedProject.name : '',
  }
}

const defaultTasks = [
  createTaskDraft({
    id: 'task-1',
    title: 'Setup board dashboard',
    description: 'Rapikan hero, stat cards, dan CTA utama di halaman dashboard.',
    status: 'berjalan',
    label: 'Frontend',
    priority: 'Tinggi',
    dueDate: '2026-06-07',
    scope: 'project',
    projectId: 'project-jlf',
    projectName: 'JanganLupa FE',
    links: [
      createTaskLinkDraft({
        label: 'Issue board',
        url: 'https://github.com/openai/janganlupa/issues/12',
      }),
    ],
  }),
  createTaskDraft({
    id: 'task-2',
    title: 'Bikin template quick add task',
    description: 'Dashboard harus bisa dipakai capture task instan tanpa buka halaman lain.',
    status: 'belum',
    label: 'UI/UX',
    priority: 'Sedang',
    dueDate: '2026-06-08',
    scope: 'personal',
    links: [
      createTaskLinkDraft({
        label: 'Catatan referensi',
        url: 'https://notes.app/quick-add',
      }),
    ],
  }),
  createTaskDraft({
    id: 'task-3',
    title: 'Setup FE project PBL',
    description: 'Siapkan struktur route dan komponen dasar untuk workspace project.',
    status: 'berjalan',
    label: 'Frontend',
    priority: 'Tinggi',
    dueDate: '2026-06-10',
    scope: 'project',
    projectId: 'project-pbl',
    projectName: 'PBL Workspace',
  }),
  createTaskDraft({
    id: 'task-4',
    title: 'Mapping role owner dan admin',
    description: 'Rapikan aturan akses owner dan admin di detail project.',
    status: 'belum',
    label: 'Backend',
    priority: 'Tinggi',
    assignee: 'Rafi',
    dueDate: '2026-06-11',
    scope: 'project',
    projectId: 'project-pbl',
    projectName: 'PBL Workspace',
  }),
  createTaskDraft({
    id: 'task-5',
    title: 'Review task pribadi mingguan',
    description: 'Cek semua task personal sebelum lanjut ke sprint berikutnya.',
    status: 'selesai',
    label: 'Meeting',
    priority: 'Rendah',
    dueDate: '2026-06-05',
    scope: 'personal',
  }),
  createTaskDraft({
    id: 'task-6',
    title: 'Definisikan flow partner request',
    description: 'Slug dan ID user dipakai sebagai jalur utama menambah partner ke project.',
    status: 'berjalan',
    label: 'Riset',
    priority: 'Sedang',
    assignee: 'Alya',
    dueDate: '2026-06-09',
    scope: 'project',
    projectId: 'project-jlf',
    projectName: 'JanganLupa FE',
  }),
]

function readInitialWorkspace() {
  if (typeof window === 'undefined') {
    return {
      currentUser: normalizeCurrentUser(defaultCurrentUser),
      projects: defaultProjects,
      tasks: defaultTasks.map((task) =>
        normalizeTask(task, defaultProjects, defaultCurrentUser.name)
      ),
      partnerRequests: defaultPartnerRequests,
    }
  }

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) {
      return {
        currentUser: normalizeCurrentUser(defaultCurrentUser),
        projects: defaultProjects,
        tasks: defaultTasks.map((task) =>
          normalizeTask(task, defaultProjects, defaultCurrentUser.name)
        ),
        partnerRequests: defaultPartnerRequests,
      }
    }

    const parsed = JSON.parse(saved)
    const nextCurrentUser = normalizeCurrentUser(parsed.currentUser)
    const nextProjectsBase = Array.isArray(parsed.projects)
      ? parsed.projects.map((project) => normalizeProject(project, nextCurrentUser.name))
      : defaultProjects
    const nextTasksSource = Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks
    const nextPartnerRequests = Array.isArray(parsed.partnerRequests)
      ? parsed.partnerRequests.map((request) => normalizePartnerRequest(request))
      : defaultPartnerRequests
    const nextProjects = ensureProjectDeadlines(nextProjectsBase, nextTasksSource)

    return {
      currentUser: nextCurrentUser,
      projects: nextProjects,
      tasks: nextTasksSource.map((task) =>
        normalizeTask(task, nextProjects, nextCurrentUser.name)
      ),
      partnerRequests: nextPartnerRequests,
    }
  } catch {
    return {
      currentUser: normalizeCurrentUser(defaultCurrentUser),
      projects: defaultProjects,
      tasks: defaultTasks.map((task) =>
        normalizeTask(task, defaultProjects, defaultCurrentUser.name)
      ),
      partnerRequests: defaultPartnerRequests,
    }
  }
}

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(readInitialWorkspace)
  const { currentUser, partnerRequests, projects, tasks } = workspace

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ currentUser, tasks, projects, partnerRequests })
    )
  }, [currentUser, partnerRequests, projects, tasks])

  const createTask = (taskInput) => {
    setWorkspace((current) => {
      const nextTask = normalizeTask(
        {
          ...taskInput,
          id: `task-${Date.now()}`,
        },
        current.projects,
        current.currentUser.name
      )

      return {
        ...current,
        tasks: [nextTask, ...current.tasks],
      }
    })
  }

  const updateTask = (taskInput) => {
    setWorkspace((current) => {
      const nextTask = normalizeTask(
        taskInput,
        current.projects,
        current.currentUser.name
      )

      return {
        ...current,
        tasks: current.tasks.map((task) => (task.id === nextTask.id ? nextTask : task)),
      }
    })
  }

  const deleteTask = (taskId) => {
    setWorkspace((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }))
  }

  const moveTask = (taskId, status, anchorTaskId = null, position = 'before') => {
    setWorkspace((current) => ({
      ...current,
      tasks: moveTaskInArray(current.tasks, taskId, status, anchorTaskId, position),
    }))
  }

  const updateProject = (projectInput) => {
    setWorkspace((current) => {
      const nextProject = {
        ...normalizeProject(projectInput, current.currentUser.name),
        deadline: projectInput.deadline?.trim?.() || getDefaultProjectDeadline(),
      }
      const maxTaskDueDate = addDaysToDate(nextProject.deadline, -1)
      const hasProject = current.projects.some((project) => project.id === nextProject.id)
      const nextProjects = hasProject
        ? current.projects.map((project) =>
            project.id === nextProject.id ? nextProject : project
          )
        : [nextProject, ...current.projects]

      const nextTasks = current.tasks.map((task) =>
        task.projectId === nextProject.id
          ? normalizeTask(
              {
                ...task,
                dueDate:
                  task.dueDate && task.dueDate > maxTaskDueDate
                    ? maxTaskDueDate
                    : task.dueDate,
                projectName: nextProject.name,
              },
              nextProjects,
              current.currentUser.name
            )
          : task
      )

      return {
        currentUser: current.currentUser,
        projects: nextProjects,
        tasks: nextTasks,
        partnerRequests: current.partnerRequests,
      }
    })
  }

  const createPartnerRequest = ({ slug, note = '' }) => {
    setWorkspace((current) => {
      const normalizedSlug = normalizeSlug(slug)
      if (!normalizedSlug || normalizedSlug === current.currentUser.slug) {
        return current
      }

      const hasExistingPartner = current.partnerRequests.some(
        (request) => request.slug === normalizedSlug
      )
      if (hasExistingPartner) {
        return current
      }

      const nextRequest = normalizePartnerRequest({
        id: `partner-${Date.now()}`,
        slug: normalizedSlug,
        note,
        status: 'Menunggu',
        direction: 'outgoing',
      })

      return {
        ...current,
        partnerRequests: [nextRequest, ...current.partnerRequests],
      }
    })
  }

  const removePartnerRequest = (partnerId) => {
    setWorkspace((current) => ({
      ...current,
      partnerRequests: current.partnerRequests.filter((request) => request.id !== partnerId),
    }))
  }

  const acceptPartnerRequest = (partnerId) => {
    setWorkspace((current) => ({
      ...current,
      partnerRequests: current.partnerRequests.map((request) =>
        request.id === partnerId
          ? normalizePartnerRequest({
              ...request,
              status: 'Terhubung',
              direction: 'connected',
              note: getPartnerConnectedNote(request.name),
            })
          : request
      ),
    }))
  }

  const updateCurrentUser = (userInput) => {
    setWorkspace((current) => {
      const previousName = current.currentUser.name
      const nextCurrentUser = normalizeCurrentUser({
        ...current.currentUser,
        ...userInput,
      })

      const renamePerson = (name) =>
        name === previousName ? nextCurrentUser.name : name

      const nextProjects = current.projects.map((project) =>
        normalizeProject(
          {
            ...project,
            owner: renamePerson(project.owner),
            admins: project.admins.map((name) => renamePerson(name)),
            members: project.members.map((name) => renamePerson(name)),
            comments: project.comments.map((comment) => ({
              ...comment,
              author: renamePerson(comment.author),
            })),
          },
          nextCurrentUser.name
        )
      )

      const nextTasks = current.tasks.map((task) =>
        normalizeTask(
          {
            ...task,
            assignee: renamePerson(task.assignee),
          },
          nextProjects,
          nextCurrentUser.name
        )
      )

      return {
        currentUser: nextCurrentUser,
        projects: nextProjects,
        tasks: nextTasks,
        partnerRequests: current.partnerRequests,
      }
    })
  }

  const value = {
    currentUser,
    tasks,
    projects,
    partnerRequests,
    createTask,
    createPartnerRequest,
    acceptPartnerRequest,
    removePartnerRequest,
    updateCurrentUser,
    updateTask,
    deleteTask,
    moveTask,
    updateProject,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
