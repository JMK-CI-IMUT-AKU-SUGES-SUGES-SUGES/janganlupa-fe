import { memo, useCallback, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  FolderOpen,
  GripVertical,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'
import {
  formatTaskDate,
  taskLabelStyles,
  taskPriorityStyles,
  taskScopeStyles,
  taskStatusMeta,
} from '../lib/taskBoard'

const taskStatusEntries = Object.entries(taskStatusMeta)

function DropIndicator({ active }) {
  return (
    <div
      aria-hidden
      className={`task-drop-indicator ${active ? 'task-drop-indicator-active' : ''}`}
    />
  )
}

const TaskCard = memo(function TaskCard({
  canDrag,
  canOpenTask,
  task,
  isDragging,
  isDropTop,
  isDropBottom,
  onClick,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
}) {
  const isProjectTask = task.scope === 'project'
  const statusMeta = taskStatusMeta[task.status]

  return (
    <div
      draggable={canDrag}
      onDragStart={canDrag ? (event) => onDragStart(task, event) : undefined}
      onDragEnd={onDragEnd}
      onDragOver={canDrag ? (event) => onDragOver(task, event) : undefined}
      onDrop={canDrag ? onDrop : undefined}
      className="group/task"
    >
      <DropIndicator active={isDropTop} />

      {canOpenTask ? (
        <button
          type="button"
          onClick={() => onClick(task.id)}
          className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 ${
            isDragging
              ? 'task-card-dragging border-brand/20 shadow-xl shadow-brand/10'
              : `${statusMeta.cardTone} hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/10`
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full bg-slate-100 p-1 text-slate-400 ${
                  canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                }`}
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${taskLabelStyles[task.label]}`}
              >
                {task.label}
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${taskPriorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          <h4 className="mt-4 text-base font-black text-slate-900">{task.title}</h4>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {task.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${taskScopeStyles[task.scope]}`}
            >
              {isProjectTask ? (
                <FolderOpen className="h-3.5 w-3.5" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}
              {isProjectTask ? 'Project' : 'Pribadi'}
            </span>
            {isProjectTask ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-brand">
                {task.projectName}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {task.assignee}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatTaskDate(task.dueDate)}
            </span>
            <span className="text-slate-500">{task.progress}%</span>
          </div>

          <div className={`mt-2 h-2 overflow-hidden rounded-full ${statusMeta.progressTrackTone}`}>
            <div
              className={`h-full rounded-full ${statusMeta.progressTone}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-end">
            <ChevronRight className="h-4 w-4 text-brand transition group-hover/task:translate-x-0.5 group-hover/task:text-brand-navy" />
          </div>
        </button>
      ) : (
        <div
          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${statusMeta.cardTone}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="cursor-default rounded-full bg-slate-100 p-1 text-slate-400">
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${taskLabelStyles[task.label]}`}
              >
                {task.label}
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${taskPriorityStyles[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          <h4 className="mt-4 text-base font-black text-slate-900">{task.title}</h4>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {task.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${taskScopeStyles[task.scope]}`}
            >
              {isProjectTask ? (
                <FolderOpen className="h-3.5 w-3.5" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}
              {isProjectTask ? 'Project' : 'Pribadi'}
            </span>
            {isProjectTask ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-brand">
                {task.projectName}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {task.assignee}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatTaskDate(task.dueDate)}
            </span>
            <span className="text-slate-500">{task.progress}%</span>
          </div>

          <div className={`mt-2 h-2 overflow-hidden rounded-full ${statusMeta.progressTrackTone}`}>
            <div
              className={`h-full rounded-full ${statusMeta.progressTone}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      <DropIndicator active={isDropBottom} />
    </div>
  )
})

export default function TaskBoard({
  eyebrow,
  title,
  description,
  tasks,
  searchQuery,
  onSearchQueryChange,
  onCreateTask,
  onOpenTask,
  onMoveTask,
  summaryCards = [],
  actionLabel = 'Tambah tugas',
  emptyState = 'Belum ada task',
  showHeader = true,
  showSearch = true,
  showActionButton = true,
  showColumnAddButton = true,
  canManageTasks = true,
  canOpenTask = true,
}) {
  const [dragState, setDragState] = useState({
    activeId: null,
    overStatus: null,
    overTaskId: null,
    edge: 'bottom',
  })

  const tasksByStatus = useMemo(
    () =>
      tasks.reduce(
        (groupedTasks, task) => {
          groupedTasks[task.status].push(task)
          return groupedTasks
        },
        {
          belum: [],
          berjalan: [],
          selesai: [],
        }
      ),
    [tasks]
  )

  const setHoverState = useCallback((nextState) => {
    setDragState((current) => {
      const resolvedState =
        typeof nextState === 'function' ? nextState(current) : nextState

      if (
        current.activeId === resolvedState.activeId &&
        current.overStatus === resolvedState.overStatus &&
        current.overTaskId === resolvedState.overTaskId &&
        current.edge === resolvedState.edge
      ) {
        return current
      }

      return resolvedState
    })
  }, [])

  const resetDragState = useCallback(() => {
    setDragState({
      activeId: null,
      overStatus: null,
      overTaskId: null,
      edge: 'bottom',
    })
  }, [])

  const handleDragStart = useCallback((task, event) => {
    if (!canManageTasks) return

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)

    const dragGhost = document.createElement('div')
    dragGhost.className = 'task-drag-ghost'
    dragGhost.textContent = task.title
    document.body.appendChild(dragGhost)
    event.dataTransfer.setDragImage(dragGhost, 24, 24)

    requestAnimationFrame(() => {
      dragGhost.remove()
    })

    setDragState({
      activeId: task.id,
      overStatus: task.status,
      overTaskId: task.id,
      edge: 'bottom',
    })
  }, [canManageTasks])

  const handleTaskDragOver = useCallback((task, event) => {
    if (!canManageTasks) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const rect = event.currentTarget.getBoundingClientRect()
    const edge = event.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom'

    setHoverState((current) => ({
      ...current,
      overStatus: task.status,
      overTaskId: task.id,
      edge,
    }))
  }, [canManageTasks, setHoverState])

  const handleTailDragOver = useCallback((status, event) => {
    if (!canManageTasks) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    setHoverState((current) => ({
      ...current,
      overStatus: status,
      overTaskId: null,
      edge: 'bottom',
    }))
  }, [canManageTasks, setHoverState])

  const handleDrop = useCallback((event) => {
    if (!canManageTasks) return

    event.preventDefault()
    event.stopPropagation()

    if (!dragState.activeId || !dragState.overStatus) return

    const anchorTaskId = dragState.overTaskId
    const position = dragState.edge === 'bottom' ? 'after' : 'before'

    onMoveTask(
      dragState.activeId,
      dragState.overStatus,
      anchorTaskId,
      anchorTaskId ? position : 'before'
    )

    resetDragState()
  }, [canManageTasks, dragState.activeId, dragState.edge, dragState.overStatus, dragState.overTaskId, onMoveTask, resetDragState])

  const hasTopSection = showHeader || showSearch || showActionButton

  return (
    <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
      {hasTopSection ? (
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {showHeader ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-black text-brand-navy">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </div>
          ) : (
            <div />
          )}

          {showSearch || showActionButton ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {showSearch ? (
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    placeholder="Cari judul, project, label, atau PIC"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                </div>
              ) : null}
              {showActionButton ? (
                <button
                  type="button"
                  onClick={() => onCreateTask('belum')}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
                >
                  <Plus className="h-4 w-4" />
                  {actionLabel}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {summaryCards.length > 0 ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
              <p className="text-sm font-bold uppercase tracking-[0.18em]">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-black text-brand-navy">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        {taskStatusEntries.map(([status, meta]) => {
          const columnTasks = tasksByStatus[status]
          const isColumnActive =
            canManageTasks && dragState.activeId && dragState.overStatus === status
          const isTailActive = isColumnActive && dragState.overTaskId === null

          return (
            <div
              key={status}
              onDrop={handleDrop}
              className={`rounded-3xl border p-4 transition-all duration-200 ${
                isColumnActive
                  ? meta.activeColumnTone
                  : meta.columnTone
              }`}
            >
              <div className={`mb-4 rounded-2xl px-4 py-3 ${meta.tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black">{meta.title}</p>
                    {meta.hint ? (
                      <p className="mt-1 text-xs font-semibold opacity-80">
                        {meta.hint}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold shadow-sm ${meta.countTone}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {showColumnAddButton && canManageTasks ? (
                <button
                  type="button"
                  onClick={() => onCreateTask(status)}
                  className={`mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-3 text-sm font-bold transition ${meta.actionTone}`}
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </button>
              ) : null}

              <div className="space-y-4">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      canDrag={canManageTasks}
                      canOpenTask={canOpenTask}
                      task={task}
                      isDragging={dragState.activeId === task.id}
                      isDropTop={
                        dragState.overTaskId === task.id && dragState.edge === 'top'
                      }
                      isDropBottom={
                        dragState.overTaskId === task.id &&
                        dragState.edge === 'bottom'
                      }
                      onClick={onOpenTask}
                      onDragStart={handleDragStart}
                      onDragEnd={resetDragState}
                      onDragOver={handleTaskDragOver}
                      onDrop={handleDrop}
                    />
                  ))
                ) : (
                  <div
                    onDragOver={
                      canManageTasks ? (event) => handleTailDragOver(status, event) : undefined
                    }
                    className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-all ${
                      isTailActive
                        ? 'border-brand/30 bg-white text-brand'
                        : meta.emptyTone
                    }`}
                  >
                    {isTailActive ? 'Taruh di sini' : emptyState}
                  </div>
                )}

                {columnTasks.length > 0 && canManageTasks ? (
                  <div
                    onDragOver={(event) => handleTailDragOver(status, event)}
                    className={`rounded-2xl border border-dashed px-4 py-4 text-center text-sm font-semibold transition-all ${
                      isTailActive
                        ? 'border-brand/30 bg-white text-brand'
                        : 'border-transparent bg-transparent text-slate-500/80'
                    }`}
                  >
                    {isTailActive ? 'Taruh di akhir' : 'Tarik ke sini'}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
