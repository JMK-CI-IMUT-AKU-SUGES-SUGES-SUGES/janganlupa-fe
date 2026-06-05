import { useCallback, useMemo, useState } from 'react'
import { CalendarDays, Link2, Plus, Save, Trash2, X } from 'lucide-react'
import {
  createTaskDraft,
  createTaskLinkDraft,
  getStatusProgress,
  taskLabelOptions,
  taskPriorityOptions,
  taskStatusMeta,
  taskStatusOptions,
} from '../lib/taskBoard'
import GlobalDrawer from './GlobalDrawer'

export default function TaskDrawer({
  open,
  mode,
  task,
  onClose,
  onDelete,
  onSave,
  projects = [],
  scopeMode = 'all',
  lockedProjectId = '',
  lockAssignee = false,
  maxDueDate = '',
}) {
  const [form, setForm] = useState(() => task ?? createTaskDraft())
  const isEditMode = mode === 'edit'
  const isProjectOnly = scopeMode === 'projectOnly'
  const isPersonalOnly = scopeMode === 'personalOnly'

  const handleChange = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }, [])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()

    const baseForm =
      scopeMode === 'personalOnly'
        ? {
            ...form,
            scope: 'personal',
            projectId: '',
            projectName: '',
          }
        : form

    const nextForm =
      maxDueDate && baseForm.dueDate > maxDueDate
        ? {
            ...baseForm,
            dueDate: maxDueDate,
          }
        : baseForm

    onSave(nextForm)
  }, [form, maxDueDate, onSave, scopeMode])

  const currentProjectId = lockedProjectId || form.projectId
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId),
    [currentProjectId, projects]
  )

  const handleScopeChange = useCallback((value) => {
    if (value === 'project') {
      const fallbackProject = selectedProject ?? projects[0]

      setForm((current) => ({
        ...current,
        scope: 'project',
        projectId: fallbackProject?.id ?? '',
        projectName: fallbackProject?.name ?? '',
      }))
      return
    }

    setForm((current) => ({
      ...current,
      scope: 'personal',
      projectId: '',
      projectName: '',
    }))
  }, [projects, selectedProject])

  const handleProjectChange = useCallback((value) => {
    const relatedProject = projects.find((project) => project.id === value)

    setForm((current) => ({
      ...current,
      scope: 'project',
      projectId: relatedProject?.id ?? '',
      projectName: relatedProject?.name ?? '',
    }))
  }, [projects])

  const handleStatusChange = useCallback((status) => {
    setForm((current) => ({
      ...current,
      status,
      progress: getStatusProgress(status),
    }))
  }, [])

  const handleProgressChange = useCallback((value) => {
    const nextProgress = Number(value)
    const nextStatus =
      nextProgress >= 100 ? 'selesai' : nextProgress <= 0 ? 'belum' : 'berjalan'

    setForm((current) => ({
      ...current,
      progress: nextProgress,
      status: nextStatus,
    }))
  }, [])

  const addLinkField = useCallback(() => {
    setForm((current) => ({
      ...current,
      links: [...(current.links ?? []), createTaskLinkDraft()],
    }))
  }, [])

  const updateLinkField = useCallback((linkId, field, value) => {
    setForm((current) => ({
      ...current,
      links: (current.links ?? []).map((link) =>
        link.id === linkId ? { ...link, [field]: value } : link
      ),
    }))
  }, [])

  const removeLinkField = useCallback((linkId) => {
    setForm((current) => ({
      ...current,
      links: (current.links ?? []).filter((link) => link.id !== linkId),
    }))
  }, [])

  const resolvedScopeLabel = useMemo(
    () =>
      isProjectOnly
        ? 'Project'
        : isPersonalOnly
          ? 'Pribadi'
          : form.scope === 'project'
            ? 'Project'
            : 'Pribadi',
    [form.scope, isPersonalOnly, isProjectOnly]
  )

  const showProjectField = useMemo(
    () => (isProjectOnly || form.scope === 'project') && !isPersonalOnly,
    [form.scope, isPersonalOnly, isProjectOnly]
  )

  return (
    <GlobalDrawer
      open={open}
      onClose={onClose}
      widthClassName="max-w-[38rem]"
    >
      <div className="flex h-full w-full min-w-0 flex-col bg-white">
        <div className="shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                {isEditMode ? 'Edit Task' : 'Task Baru'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                {isEditMode ? form.title || 'Tanpa judul' : 'Task Baru'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Judul tugas
              </span>
              <input
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder="Judul task"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <span className="text-sm font-semibold text-brand-navy">Status</span>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {taskStatusOptions.map((option) => {
                  const isActive = form.status === option.value
                  const statusMeta = taskStatusMeta[option.value]

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? `${statusMeta.accent} ${statusMeta.tone} shadow-md`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand/20 hover:bg-blue-50/50'
                      }`}
                    >
                      <p className="text-sm font-black">{statusMeta.title}</p>
                      {statusMeta.hint ? (
                        <p className="mt-1 text-xs font-medium opacity-80">
                          {statusMeta.hint}
                        </p>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-brand-navy">Progress</span>
                <span className="text-sm font-black text-brand-navy">
                  {form.progress}%
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${taskStatusMeta[form.status].progressTone}`}
                  style={{ width: `${form.progress}%` }}
                />
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress}
                onChange={(event) => handleProgressChange(event.target.value)}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-brand"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {!isProjectOnly && !isPersonalOnly ? (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    Tipe task
                  </span>
                  <select
                    value={form.scope}
                    onChange={(event) => handleScopeChange(event.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="personal">Pribadi</option>
                    <option value="project">Project</option>
                  </select>
                </label>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Tipe task
                  </p>
                  <p className="mt-1 cursor-default font-semibold text-brand-navy">
                    {resolvedScopeLabel}
                  </p>
                </div>
              )}

              {showProjectField ? (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    Project
                  </span>
                  <select
                    value={currentProjectId}
                    onChange={(event) => handleProjectChange(event.target.value)}
                    disabled={isProjectOnly}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Ruang kerja
                  </p>
                  <p className="mt-1 cursor-default font-semibold text-brand-navy">
                    Task pribadi
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Prioritas
                </span>
                <select
                  value={form.priority}
                  onChange={(event) => handleChange('priority', event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                >
                  {taskPriorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Label
                </span>
                <select
                  value={form.label}
                  onChange={(event) => handleChange('label', event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                >
                  {taskLabelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {isPersonalOnly || lockAssignee ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    PIC
                  </p>
                  <p className="mt-1 cursor-default font-semibold text-brand-navy">
                    {form.assignee}
                  </p>
                </div>
              ) : (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    PIC
                  </span>
                  <input
                    value={form.assignee}
                    onChange={(event) => handleChange('assignee', event.target.value)}
                    placeholder="Nama"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                  Deadline
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => handleChange('dueDate', event.target.value)}
                    max={maxDueDate || undefined}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {maxDueDate ? (
                  <p className="mt-1.5 text-xs font-medium text-slate-500">
                    Maksimal {maxDueDate}
                  </p>
                ) : null}
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Deskripsi
              </span>
              <textarea
                rows={8}
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Catatan"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 p-2 text-brand">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">Link terkait</p>
                    <p className="text-xs text-slate-500">Bisa tambah atau hapus link</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addLinkField}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand/20 hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah link
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {(form.links?.length ?? 0) > 0 ? (
                  form.links.map((link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <Link2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Link {index + 1}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                          <input
                            value={link.label}
                            onChange={(event) =>
                              updateLinkField(link.id, 'label', event.target.value)
                            }
                            placeholder="Keterangan"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(event) =>
                              updateLinkField(link.id, 'url', event.target.value)
                            }
                            placeholder="https://..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLinkField(link.id)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-600 transition hover:bg-rose-100"
                        aria-label={`Hapus link ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                    Belum ada link disisipkan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4">
            <div>
              {isEditMode ? (
                <button
                  type="button"
                  onClick={() => onDelete(form.id)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus tugas
                </button>
              ) : (
                <div />
              )}
            </div>

            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
            >
              <Save className="h-4 w-4" />
              Simpan tugas
            </button>
          </div>
        </form>
      </div>
    </GlobalDrawer>
  )
}
