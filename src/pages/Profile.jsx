import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AtSign,
  CheckCircle2,
  FolderOpen,
  LogOut,
  Mail,
  Save,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import useWorkspace from '../hooks/useWorkspace'
import { getInitials } from '../lib/projectUtils'

function buildInitialForm(currentUser) {
  return {
    name: currentUser.name,
    email: currentUser.email,
    slug: currentUser.slug,
    role: currentUser.role,
    focus: currentUser.focus,
    timezone: currentUser.timezone,
    status: currentUser.status,
  }
}

function normalizeProfileForm(form) {
  const trimmedName = form.name.trim()
  const rawSlug = form.slug.trim().replace(/\s+/g, '')
  const normalizedSlug =
    rawSlug || `@${trimmedName.toLowerCase().replace(/\s+/g, '')}`

  return {
    ...form,
    name: trimmedName,
    slug: normalizedSlug.startsWith('@') ? normalizedSlug : `@${normalizedSlug}`,
    email: form.email.trim(),
    role: form.role.trim(),
    focus: form.focus.trim(),
    timezone: form.timezone.trim(),
    status: form.status.trim(),
  }
}

function StatCard({ icon: Icon, label, value, tone = 'slate' }) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-100 bg-emerald-50/80'
      : tone === 'blue'
        ? 'border-blue-100 bg-blue-50/80'
        : 'border-slate-200 bg-slate-50/80'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        <Icon className="h-4 w-4 text-brand" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-brand-navy">{value}</p>
    </div>
  )
}

function Field({ label, icon: Icon, children, readOnly = false }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        <Icon className="h-4 w-4 text-brand" />
        {label}
      </span>
      <div
        className={`rounded-2xl border bg-white px-4 py-3 shadow-sm transition ${
          readOnly
            ? 'border-slate-200 text-slate-500'
            : 'border-slate-200 focus-within:border-brand-navy focus-within:ring-4 focus-within:ring-brand/10'
        }`}
      >
        {children}
      </div>
    </label>
  )
}

export default function Profile() {
  const { currentUser, partnerRequests, projects, tasks, updateCurrentUser } = useWorkspace()
  const [form, setForm] = useState(() => buildInitialForm(currentUser))

  const connectedPartners = useMemo(
    () => partnerRequests.filter((request) => request.direction === 'connected'),
    [partnerRequests]
  )

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assignee === currentUser.name),
    [currentUser.name, tasks]
  )

  const activeTasks = myTasks.filter((task) => task.status !== 'selesai')
  const relatedProjects = projects.filter(
    (project) =>
      project.owner === currentUser.name ||
      project.admins.includes(currentUser.name) ||
      project.members.includes(currentUser.name)
  )

  const hasChanges =
    form.name !== currentUser.name ||
    form.email !== currentUser.email ||
    form.slug !== currentUser.slug ||
    form.role !== currentUser.role ||
    form.focus !== currentUser.focus ||
    form.timezone !== currentUser.timezone ||
    form.status !== currentUser.status

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleReset = () => {
    setForm(buildInitialForm(currentUser))
  }

  const handleSave = (event) => {
    event.preventDefault()
    const nextForm = normalizeProfileForm(form)
    updateCurrentUser(nextForm)
    setForm(buildInitialForm({ ...currentUser, ...nextForm }))
  }

  const avatarSeed = encodeURIComponent(form.slug || form.name)

  return (
    <AppLayout>
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">Akun</p>
          <h1 className="mt-2 text-3xl font-black text-brand-navy md:text-4xl">
            Profile
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {currentUser.id}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {currentUser.status}
          </span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] p-6 text-white shadow-2xl shadow-brand/15">
            <div className="flex flex-col items-center text-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt={form.name}
                className="h-28 w-28 rounded-full border-4 border-white/40 bg-white/10 object-cover shadow-xl"
              />
              <h2 className="mt-4 text-2xl font-black">{form.name}</h2>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{form.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                  {form.slug}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                  {form.timezone}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                  Task aktif
                </p>
                <p className="mt-2 text-2xl font-black">{activeTasks.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                  Project
                </p>
                <p className="mt-2 text-2xl font-black">{relatedProjects.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                  Partner
                </p>
                <p className="mt-2 text-2xl font-black">{connectedPartners.length}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={ListTodoIcon} label="My Task" value={myTasks.length} tone="slate" />
            <StatCard icon={FolderOpen} label="Workspace" value={relatedProjects.length} tone="blue" />
            <StatCard icon={Users} label="Terhubung" value={connectedPartners.length} tone="emerald" />
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Kolaborator terdekat
                </p>
                <h3 className="mt-2 text-xl font-black text-brand-navy">Partner aktif</h3>
              </div>
              <Users className="h-5 w-5 text-brand" />
            </div>

            <div className="mt-5 space-y-3">
              {connectedPartners.length > 0 ? (
                connectedPartners.slice(0, 4).map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#001529_0%,#0052cc_100%)] text-sm font-black text-white shadow-sm">
                        {getInitials(partner.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-black text-brand-navy">{partner.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{partner.slug}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {partner.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
                  Belum ada partner terhubung.
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                Edit profile
              </p>
              <h2 className="mt-2 text-2xl font-black text-brand-navy">
                Update identitas akun
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/login"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:text-brand"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
              <button
                type="submit"
                disabled={!hasChanges}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition hover:-translate-y-0.5 hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Save className="h-4 w-4" />
                Simpan
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Nama lengkap" icon={UserRound}>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>

            <Field label="Slug" icon={AtSign}>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => handleChange('slug', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>

            <Field label="Zona waktu" icon={Sparkles}>
              <input
                type="text"
                value={form.timezone}
                onChange={(event) => handleChange('timezone', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>

            <Field label="Peran" icon={CheckCircle2}>
              <input
                type="text"
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>

            <Field label="Status" icon={CheckCircle2}>
              <input
                type="text"
                value={form.status}
                onChange={(event) => handleChange('status', event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Fokus utama" icon={Sparkles}>
              <textarea
                rows={4}
                value={form.focus}
                onChange={(event) => handleChange('focus', event.target.value)}
                className="w-full resize-none border-0 bg-transparent p-0 text-sm font-bold text-brand-navy outline-none"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:text-brand"
            >
              Reset
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              Perubahan nama akan ikut update task dan project milikmu
            </span>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}

function ListTodoIcon(props) {
  return <CheckCircle2 {...props} />
}
