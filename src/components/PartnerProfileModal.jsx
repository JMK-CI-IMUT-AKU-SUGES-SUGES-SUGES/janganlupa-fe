import {
  AtSign,
  CheckCircle2,
  FolderOpen,
  Trash2,
  UserCheck2,
  UserMinus2,
  Users,
  X,
} from 'lucide-react'
import GlobalModal from './GlobalModal'
import { getInitials } from '../lib/projectUtils'

const relationMeta = {
  connected: {
    title: 'Partner terhubung',
    tone: 'bg-emerald-100 text-emerald-700',
    actionLabel: 'Hapus pertemanan',
    actionTone:
      'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
    icon: UserMinus2,
  },
  outgoing: {
    title: 'Pending partner',
    tone: 'bg-blue-100 text-brand',
    actionLabel: 'Batalkan permintaan',
    actionTone:
      'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
    icon: UserMinus2,
  },
  incoming: {
    title: 'Permohonan masuk',
    tone: 'bg-amber-100 text-amber-700',
    actionLabel: 'Tolak permohonan',
    actionTone:
      'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
    icon: Trash2,
  },
}

function StatCard({ icon: Icon, label, value, valueTone = 'text-brand-navy' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-4 w-4 text-brand" />
        {label}
      </div>
      <p className={`mt-3 text-lg font-black ${valueTone}`}>{value}</p>
    </div>
  )
}

export default function PartnerProfileModal({
  open,
  partner,
  onClose,
  onAccept,
  onRemove,
}) {
  if (!partner) return null

  const meta = relationMeta[partner.direction] ?? relationMeta.connected
  const RemoveIcon = meta.icon

  return (
    <GlobalModal open={open} onClose={onClose} widthClassName="max-w-3xl">
      <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#001529_0%,#0052cc_62%,#14b8a6_100%)] px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-black text-brand shadow-lg">
                {getInitials(partner.name)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">
                  Detail partner
                </p>
                <h2 className="mt-2 truncate text-3xl font-black">{partner.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                    <AtSign className="h-3.5 w-3.5" />
                    {partner.slug.replace(/^@/, '')}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.tone}`}>
                    {partner.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Users} label="Relasi" value={meta.title} />
            <StatCard
              icon={FolderOpen}
              label="Project bersama"
              value={`${partner.sharedProjects ?? 0} project`}
            />
            <StatCard
              icon={CheckCircle2}
              label="Status"
              value={partner.status}
              valueTone={
                partner.direction === 'connected'
                  ? 'text-emerald-700'
                  : partner.direction === 'incoming'
                    ? 'text-amber-700'
                    : 'text-brand'
              }
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                Ringkasan
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Slug
                  </p>
                  <p className="mt-2 text-lg font-black text-brand-navy">{partner.slug}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Catatan
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    {partner.note || 'Belum ada catatan tambahan.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                Project bersama
              </p>
              <div className="mt-4 space-y-3">
                {(partner.relatedProjects?.length ?? 0) > 0 ? (
                  partner.relatedProjects.map((projectName) => (
                    <div
                      key={projectName}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-brand-navy">{projectName}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                        Aktif
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
                    Belum ada project bersama.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Tutup
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {partner.direction === 'incoming' ? (
                <button
                  type="button"
                  onClick={() => onAccept?.(partner.id)}
                  className="inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition hover:-translate-y-0.5 hover:bg-brand"
                >
                  <UserCheck2 className="h-4 w-4" />
                  Terima
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => onRemove?.(partner.id)}
                className={`inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${meta.actionTone}`}
              >
                <RemoveIcon className="h-4 w-4" />
                {meta.actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalModal>
  )
}
