export const taskStatusMeta = {
  belum: {
    title: 'Belum Selesai',
    hint: '',
    tone: 'border border-slate-300 bg-slate-200/85 text-slate-800 shadow-sm shadow-slate-200/80',
    accent: 'border-slate-300',
    columnTone:
      'border-slate-300 bg-[linear-gradient(180deg,rgba(226,232,240,0.78)_0%,rgba(248,250,252,0.98)_100%)]',
    activeColumnTone: 'border-slate-400 bg-slate-100 shadow-lg shadow-slate-200/70',
    countTone: 'bg-white/90 text-slate-700',
    actionTone:
      'border-slate-300 bg-white/85 text-slate-700 hover:border-slate-400 hover:bg-white hover:text-slate-900',
    emptyTone: 'border-slate-300 bg-white/80 text-slate-500',
    cardTone:
      'border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,245,249,0.96)_100%)] shadow-sm shadow-slate-200/80',
    progressTone: 'bg-slate-500',
    progressTrackTone: 'bg-slate-200/90',
  },
  berjalan: {
    title: 'Berjalan',
    hint: '',
    tone: 'border border-blue-200 bg-blue-100/95 text-blue-800 shadow-sm shadow-blue-100/80',
    accent: 'border-blue-200',
    columnTone:
      'border-blue-200 bg-[linear-gradient(180deg,rgba(191,219,254,0.58)_0%,rgba(239,246,255,0.98)_100%)]',
    activeColumnTone: 'border-blue-300 bg-blue-50 shadow-lg shadow-blue-100/80',
    countTone: 'bg-white/90 text-blue-700',
    actionTone:
      'border-blue-200 bg-white/85 text-blue-700 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-900',
    emptyTone: 'border-blue-200 bg-white/80 text-blue-700',
    cardTone:
      'border-blue-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.97)_100%)] shadow-sm shadow-blue-100/80',
    progressTone: 'bg-blue-600',
    progressTrackTone: 'bg-blue-100/90',
  },
  selesai: {
    title: 'Selesai',
    hint: '',
    tone: 'border border-emerald-200 bg-emerald-100/90 text-emerald-800 shadow-sm shadow-emerald-100/80',
    accent: 'border-emerald-200',
    columnTone:
      'border-emerald-200 bg-[linear-gradient(180deg,rgba(167,243,208,0.48)_0%,rgba(236,253,245,0.98)_100%)]',
    activeColumnTone:
      'border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-100/80',
    countTone: 'bg-white/90 text-emerald-700',
    actionTone:
      'border-emerald-200 bg-white/85 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-900',
    emptyTone: 'border-emerald-200 bg-white/80 text-emerald-700',
    cardTone:
      'border-emerald-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(236,253,245,0.97)_100%)] shadow-sm shadow-emerald-100/80',
    progressTone: 'bg-emerald-600',
    progressTrackTone: 'bg-emerald-100/90',
  },
}

export const taskStatusOptions = [
  { value: 'belum', label: 'Belum selesai' },
  { value: 'berjalan', label: 'Berjalan' },
  { value: 'selesai', label: 'Selesai' },
]

export const taskPriorityOptions = ['Rendah', 'Sedang', 'Tinggi']

export const taskLabelOptions = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Riset',
  'Meeting',
]

export const taskLabelStyles = {
  Frontend: 'bg-blue-100 text-blue-700',
  Backend: 'bg-sky-100 text-sky-700',
  'UI/UX': 'bg-violet-100 text-violet-700',
  Riset: 'bg-amber-100 text-amber-700',
  Meeting: 'bg-emerald-100 text-emerald-700',
}

export const taskPriorityStyles = {
  Tinggi: 'bg-rose-100 text-rose-600',
  Sedang: 'bg-amber-100 text-amber-700',
  Rendah: 'bg-slate-100 text-slate-600',
}

export const taskScopeStyles = {
  personal: 'bg-slate-100 text-slate-600',
  project: 'bg-brand/10 text-brand',
}

export function createTaskLinkDraft(overrides = {}) {
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: '',
    url: '',
    ...overrides,
  }
}

export function normalizeTaskLinks(links) {
  if (!Array.isArray(links)) return []

  return links
    .map((link) => {
      if (typeof link === 'string') {
        return createTaskLinkDraft({ url: link.trim() })
      }

      return createTaskLinkDraft({
        id: link?.id,
        label: link?.label?.trim?.() ?? link?.description?.trim?.() ?? '',
        url: link?.url?.trim?.() ?? '',
      })
    })
    .filter((link) => link.label.length > 0 || link.url.length > 0)
}

export function getStatusProgress(status) {
  switch (status) {
    case 'selesai':
      return 100
    case 'berjalan':
      return 60
    default:
      return 0
  }
}

export function normalizeTaskProgress(progressValue, status = 'belum') {
  const parsedProgress = Number(progressValue)

  if (Number.isNaN(parsedProgress)) {
    return getStatusProgress(status)
  }

  return Math.min(100, Math.max(0, Math.round(parsedProgress)))
}

export function createTaskDraft(overrides = {}) {
  const nextStatus = overrides.status ?? 'belum'
  const nextProgress = normalizeTaskProgress(overrides.progress, nextStatus)

  return {
    id: '',
    title: '',
    description: '',
    status: nextStatus,
    progress: nextProgress,
    label: 'Frontend',
    priority: 'Sedang',
    assignee: 'Narendra',
    dueDate: new Date().toISOString().slice(0, 10),
    scope: 'personal',
    projectId: '',
    projectName: '',
    links: [],
    ...overrides,
  }
}

export function formatTaskDate(dateValue) {
  if (!dateValue) return 'Tanpa deadline'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export function moveTaskInArray(
  tasks,
  draggedId,
  nextStatus,
  anchorTaskId = null,
  position = 'before'
) {
  const nextTasks = [...tasks]
  const draggedIndex = nextTasks.findIndex((task) => task.id === draggedId)

  if (draggedIndex === -1) return tasks

  const [draggedTask] = nextTasks.splice(draggedIndex, 1)
  const updatedTask = {
    ...draggedTask,
    status: nextStatus,
    progress: getStatusProgress(nextStatus),
  }

  if (anchorTaskId) {
    const targetIndex = nextTasks.findIndex((task) => task.id === anchorTaskId)

    if (targetIndex === -1) {
      nextTasks.push(updatedTask)
      return nextTasks
    }

    const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex

    nextTasks.splice(insertIndex, 0, updatedTask)
    return nextTasks
  }

  nextTasks.push(updatedTask)
  return nextTasks
}
