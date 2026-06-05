import { useCallback, useMemo, useState } from 'react'
import { ArrowUpRight, AtSign, BellDot, Inbox, Plus, Users } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import PartnerProfileModal from '../components/PartnerProfileModal'
import useWorkspace from '../hooks/useWorkspace'
import { getInitials } from '../lib/projectUtils'

function normalizeSlugInput(value = '') {
  const compactValue = value.trim().replace(/\s+/g, '')
  if (!compactValue) return ''
  return compactValue.startsWith('@')
    ? compactValue.toLowerCase()
    : `@${compactValue.toLowerCase()}`
}

function getSharedProjectCount(partnerName, projects) {
  return getSharedProjectNames(partnerName, projects).length
}

function getSharedProjectNames(partnerName, projects) {
  const normalizedNames = partnerName
    .toLowerCase()
    .split(' ')
    .filter(Boolean)

  return projects
    .filter((project) => {
      const projectPeople = [
        project.owner,
        ...project.admins,
        ...project.members,
      ].map((person) => person.toLowerCase())

      return normalizedNames.some((name) => projectPeople.includes(name))
    })
    .map((project) => project.name)
}

function EmptyState({ label }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
      {label}
    </div>
  )
}

function PartnerRow({ partner, accent = 'emerald', extraLabel, onOpen }) {
  const accentTone =
    accent === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : accent === 'blue'
        ? 'bg-blue-50 text-brand'
        : 'bg-emerald-50 text-emerald-700'

  return (
    <button
      type="button"
      onClick={() => onOpen(partner.id)}
      className="group w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#001529_0%,#0052cc_100%)] text-sm font-black text-white shadow-sm">
            {getInitials(partner.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-black text-brand-navy">{partner.name}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{partner.slug}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {extraLabel ? (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
              {extraLabel}
            </span>
          ) : null}
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${accentTone}`}>
            {partner.status}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition group-hover:text-brand">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {partner.note ? (
        <p className="mt-3 truncate text-sm text-slate-600">{partner.note}</p>
      ) : null}
    </button>
  )
}

export default function Partner() {
  const {
    acceptPartnerRequest,
    createPartnerRequest,
    currentUser,
    partnerRequests,
    projects,
    removePartnerRequest,
  } = useWorkspace()
  const [slugInput, setSlugInput] = useState('')
  const [activePartnerId, setActivePartnerId] = useState(null)

  const normalizedSlug = normalizeSlugInput(slugInput)
  const enrichedPartners = useMemo(
    () =>
      partnerRequests.map((partner) => ({
        ...partner,
        sharedProjects: getSharedProjectCount(partner.name, projects),
        relatedProjects: getSharedProjectNames(partner.name, projects),
      })),
    [partnerRequests, projects]
  )

  const connectedPartners = useMemo(
    () =>
      enrichedPartners
        .filter((request) => request.direction === 'connected')
        .sort((left, right) => right.sharedProjects - left.sharedProjects),
    [enrichedPartners]
  )

  const pendingPartners = useMemo(
    () => enrichedPartners.filter((request) => request.direction === 'outgoing'),
    [enrichedPartners]
  )

  const friendRequests = useMemo(
    () => enrichedPartners.filter((request) => request.direction === 'incoming'),
    [enrichedPartners]
  )
  const activePartner = useMemo(
    () => enrichedPartners.find((partner) => partner.id === activePartnerId) ?? null,
    [activePartnerId, enrichedPartners]
  )

  const hasDuplicateSlug = partnerRequests.some(
    (request) => request.slug === normalizedSlug
  )
  const isOwnSlug = normalizedSlug === currentUser.slug
  const canSubmit = normalizedSlug.length > 0 && !hasDuplicateSlug && !isOwnSlug

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    createPartnerRequest({
      slug: normalizedSlug,
      note: 'Menunggu konfirmasi partner',
    })
    setSlugInput('')
  }

  const openPartnerModal = useCallback((partnerId) => {
    setActivePartnerId(partnerId)
  }, [])

  const closePartnerModal = useCallback(() => {
    setActivePartnerId(null)
  }, [])

  const handleRemovePartner = useCallback(
    (partnerId) => {
      removePartnerRequest(partnerId)
      setActivePartnerId(null)
    },
    [removePartnerRequest]
  )

  const handleAcceptPartner = useCallback(
    (partnerId) => {
      acceptPartnerRequest(partnerId)
      setActivePartnerId(null)
    },
    [acceptPartnerRequest]
  )

  return (
    <AppLayout active="Partner">
      <section className="mb-6 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
                Partner
              </p>
              <h1 className="mt-2 text-3xl font-black text-brand-navy md:text-4xl">
                Kelola partner
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-brand-navy px-4 py-3 text-white shadow-lg shadow-brand-navy/15">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                  Slug kamu
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-cyan-100" />
                  <p className="text-lg font-black">{currentUser.slug.replace(/^@/, '')}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  ID akun
                </p>
                <p className="mt-2 text-lg font-black text-brand-navy">{currentUser.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
                  Tambah partner
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                    {connectedPartners.length} partner
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
                    {pendingPartners.length} pending
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    {friendRequests.length} permohonan
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-3 xl:max-w-2xl xl:flex-row"
              >
                <div className="relative flex-1">
                  <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(event) => setSlugInput(event.target.value)}
                    placeholder="Masukkan slug partner"
                    className="min-h-[72px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-brand-navy focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex min-h-[72px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand-navy px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  Tambah partner
                </button>
              </form>
            </div>

            {normalizedSlug ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {hasDuplicateSlug ? (
                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
                    Slug sudah ada
                  </span>
                ) : null}
                {isOwnSlug ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    Gunakan slug partner lain
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
              <Users className="h-4 w-4" />
              Daftar partner
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {connectedPartners.length} terhubung
            </span>
          </div>

          <div className="space-y-3">
            {connectedPartners.length > 0 ? (
              connectedPartners.map((partner) => (
                <PartnerRow
                  key={partner.id}
                  partner={partner}
                  accent="emerald"
                  extraLabel={`${partner.sharedProjects} project`}
                  onOpen={openPartnerModal}
                />
              ))
            ) : (
              <EmptyState label="Belum ada partner terhubung." />
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
              Pending & permohonan
            </p>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {pendingPartners.length + friendRequests.length} item
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <BellDot className="h-4 w-4 text-brand" />
                Pending partner
              </div>
              <div className="space-y-3">
                {pendingPartners.length > 0 ? (
                  pendingPartners.map((partner) => (
                    <PartnerRow
                      key={partner.id}
                      partner={partner}
                      accent="blue"
                      onOpen={openPartnerModal}
                    />
                  ))
                ) : (
                  <EmptyState label="Belum ada partner yang menunggu konfirmasi." />
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <Inbox className="h-4 w-4 text-amber-500" />
                Permohonan pertemanan
              </div>
              <div className="space-y-3">
                {friendRequests.length > 0 ? (
                  friendRequests.map((partner) => (
                    <PartnerRow
                      key={partner.id}
                      partner={partner}
                      accent="amber"
                      onOpen={openPartnerModal}
                    />
                  ))
                ) : (
                  <EmptyState label="Belum ada permohonan pertemanan masuk." />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PartnerProfileModal
        open={Boolean(activePartner)}
        partner={activePartner}
        onClose={closePartnerModal}
        onAccept={handleAcceptPartner}
        onRemove={handleRemovePartner}
      />
    </AppLayout>
  )
}
