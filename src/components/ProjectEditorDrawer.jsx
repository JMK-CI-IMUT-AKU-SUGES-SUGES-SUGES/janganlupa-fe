import { useState } from 'react'
import { CalendarDays, Link2, Plus, Save, Trash2, X } from 'lucide-react'
import GlobalDrawer from './GlobalDrawer'
import {
  getInitials,
  getProjectPeople,
  getProjectRole,
  projectRoleMeta,
} from '../lib/projectUtils'
import { createTaskLinkDraft } from '../lib/taskBoard'
import { projectSchema, formatZodErrors } from '../lib/validation'

export default function ProjectEditorDrawer({
  mode = 'edit',
  open,
  project,
  currentUserName,
  onClose,
  onSave,
  serverError = '',
}) {
  const [form, setForm] = useState(project)
  const [error, setError] = useState('')

  if (!form) return null

  const isCreateMode = mode === 'create'
  const people = getProjectPeople(form)
  const currentRole = getProjectRole(form, currentUserName)
  const currentRoleMeta = projectRoleMeta[currentRole]

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    const result = projectSchema.safeParse(form)
    if (!result.success) {
      setError(formatZodErrors(result.error))
      return
    }

    onSave(form)
  }

  const addLinkField = () => {
    setForm((current) => ({
      ...current,
      links: [...(current.links ?? []), createTaskLinkDraft()],
    }))
  }

  const updateLinkField = (linkId, field, value) => {
    setForm((current) => ({
      ...current,
      links: (current.links ?? []).map((link) =>
        link.id === linkId ? { ...link, [field]: value } : link
      ),
    }))
  }

  const removeLinkField = (linkId) => {
    setForm((current) => ({
      ...current,
      links: (current.links ?? []).filter((link) => link.id !== linkId),
    }))
  }

  return (
    <GlobalDrawer
      open={open}
      onClose={onClose}
      widthClassName="max-w-[36rem]"
    >
      <div className="flex h-full w-full min-w-0 flex-col bg-white">
        <div className="shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                {isCreateMode ? 'Project Baru' : 'Edit Project'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                {form.name || 'Project'}
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
                Nama project
              </span>
              <input
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Nama project"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Deskripsi
              </span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Ringkasan project"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Deadline project
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) => handleChange('deadline', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-navy">Aksesmu</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${currentRoleMeta.tone}`}
                >
                  {currentRoleMeta.label}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Owner
                  </p>
                  <p className="mt-1 font-semibold text-brand-navy">{form.owner}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Partner
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {people.map((person) => (
                      <div
                        key={`${person.role}-${person.name}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-black text-brand shadow-sm">
                          {getInitials(person.name)}
                        </span>
                        <span className="text-sm font-semibold text-brand-navy">
                          {person.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${projectRoleMeta[person.role].tone}`}
                        >
                          {projectRoleMeta[person.role].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Link project
                    </p>
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
                        Belum ada link project.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 bg-white px-6 py-4">
            {(error || serverError) ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {error || serverError}
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand"
              >
                <Save className="h-4 w-4" />
                {isCreateMode ? 'Buat project' : 'Simpan project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </GlobalDrawer>
  )
}
