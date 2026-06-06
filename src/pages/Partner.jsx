import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowUpRight, AtSign, BellDot, Inbox, Plus, Users } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { getInitials } from '../lib/projectUtils'
import { partnerSlugSchema, formatZodErrors } from '../lib/validation'

const PartnerProfileModal = lazy(() => import('../components/PartnerProfileModal'))

function normalizeSlugInput(value = '') {
  const compactValue = value.trim().replace(/\s+/g, '')
  if (!compactValue) return ''
  return compactValue.startsWith('@')
    ? compactValue.toLowerCase()
    : `@${compactValue.toLowerCase()}`
}

function getSharedProjectNames(partnerId, projects) {
  return projects
    .filter((project) => {
      const projectPeopleIds = project.users?.map(u => u.id) || []
      return projectPeopleIds.includes(partnerId)
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
      onClick={() => onOpen(partner.id, partner.relationId)}
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
  const { user } = useAuth()
  const [slugInput, setSlugInput] = useState('')
  const [activePartnerId, setActivePartnerId] = useState(null)
  const [activeRelationId, setActiveRelationId] = useState(null)

  const [partners, setPartners] = useState([])
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)

  const normalizedSlug = normalizeSlugInput(slugInput)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [partnersRes, requestsRes, projectsRes] = await Promise.all([
        api.get('/partners'),
        api.get('/partners/requests'),
        api.get('/projects')
      ])

      const connected = partnersRes.data.data.partners.map(p => ({
        ...p,
        relationId: p.relation_id,
        direction: 'connected',
        status: 'Terhubung',
        note: 'Partner aktif'
      }))

      const inc = requestsRes.data.data.incoming.map(r => ({
        ...r.requester,
        direction: 'incoming',
        status: 'Perlu ditinjau',
        note: r.note || 'Ingin terhubung',
        relationId: r.id
      }))

      const out = requestsRes.data.data.outgoing.map(r => ({
        ...r.receiver,
        direction: 'outgoing',
        status: 'Menunggu',
        note: r.note || 'Menunggu konfirmasi',
        relationId: r.id
      }))

      setPartners(connected)
      setIncoming(inc)
      setOutgoing(out)
      setProjects(projectsRes.data.data.projects)
    } catch (error) {
      console.error('Error fetching partner data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const enrichedConnected = useMemo(() => {
    return partners.map(p => {
      const sharedNames = getSharedProjectNames(p.id, projects)
      return {
        ...p,
        sharedProjects: sharedNames.length,
        relatedProjects: sharedNames
      }
    }).sort((a, b) => b.sharedProjects - a.sharedProjects)
  }, [partners, projects])

  const allRequests = useMemo(() => [...incoming, ...outgoing], [incoming, outgoing])
  const activePartner = useMemo(() => {
    const all = [...enrichedConnected, ...allRequests]
    return all.find(p => p.id === activePartnerId) || null
  }, [activePartnerId, enrichedConnected, allRequests])

  const isOwnSlug = normalizedSlug === user?.slug
  const hasDuplicateSlug = [...partners, ...allRequests].some(p => p.slug === normalizedSlug)
  const canSubmit = normalizedSlug.length > 0 && !hasDuplicateSlug && !isOwnSlug && !loading

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return

    const result = partnerSlugSchema.safeParse({ slug: normalizedSlug })
    if (!result.success) {
      toast.error(formatZodErrors(result.error))
      return
    }

    try {
      setLoading(true)
      await api.post('/partners/request', {
        slug: normalizedSlug.replace(/^@/, ''),
        note: 'Menunggu konfirmasi partner'
      })
      toast.success('Permintaan partner terkirim')
      setSlugInput('')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.meta?.message || 'Gagal mengirim request')
    } finally {
      setLoading(false)
    }
  }

  const openPartnerModal = useCallback((partnerId, relationId) => {
    setActivePartnerId(partnerId)
    setActiveRelationId(relationId)
  }, [])

  const closePartnerModal = useCallback(() => {
    setActivePartnerId(null)
    setActiveRelationId(null)
  }, [])

  const handleRemovePartner = useCallback(
    async (partnerId) => {
      if (!partnerId) {
        toast.error('ID partner tidak valid')
        return
      }

      try {
        const relId = activeRelationId
        if (relId) {
           await api.delete(`/partners/${relId}`)
           toast.success('Partner berhasil dihapus')
           fetchData()
        } else {
           toast.error("Maaf, API saat ini memerlukan ID Relasi untuk menghapus partner aktif. (Akan diperbaiki di backend)")
        }
        closePartnerModal()
      } catch (err) {
        toast.error(err.response?.data?.meta?.message || 'Gagal menghapus partner')
      }
    },
    [activeRelationId, closePartnerModal, fetchData]
  )

  const handleAcceptPartner = useCallback(
    async (partnerId) => {
      if (!partnerId) {
        toast.error('ID partner tidak valid')
        return
      }

      try {
        if (activeRelationId) {
          await api.put(`/partners/requests/${activeRelationId}`, { status: 'accepted' })
          toast.success('Permintaan partner diterima')
          fetchData()
        }
        closePartnerModal()
      } catch (err) {
        toast.error(err.response?.data?.meta?.message || 'Gagal menerima partner')
      }
    },
    [activeRelationId, closePartnerModal, fetchData]
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
                  <p className="text-lg font-black">{user?.slug?.replace(/^@/, '')}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  ID akun
                </p>
                <p className="mt-2 text-lg font-black text-brand-navy">{user?.id?.split('-')[0]}</p>
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
                    {enrichedConnected.length} partner
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand">
                    {outgoing.length} pending
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    {incoming.length} permohonan
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
                  {loading ? 'Processing...' : 'Tambah partner'}
                </button>
              </form>
            </div>

            {normalizedSlug ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {hasDuplicateSlug ? (
                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
                    Slug sudah terhubung / pending
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
              {enrichedConnected.length} terhubung
            </span>
          </div>

          <div className="space-y-3">
            {enrichedConnected.length > 0 ? (
              enrichedConnected.map((partner) => (
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
              {outgoing.length + incoming.length} item
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <BellDot className="h-4 w-4 text-brand" />
                Pending partner
              </div>
              <div className="space-y-3">
                {outgoing.length > 0 ? (
                  outgoing.map((partner) => (
                    <PartnerRow
                      key={partner.relationId}
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
                {incoming.length > 0 ? (
                  incoming.map((partner) => (
                    <PartnerRow
                      key={partner.relationId}
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

      {activePartner ? (
        <Suspense fallback={null}>
          <PartnerProfileModal
            open={Boolean(activePartner)}
            partner={activePartner}
            onClose={closePartnerModal}
            onAccept={handleAcceptPartner}
            onRemove={handleRemovePartner}
          />
        </Suspense>
      ) : null}
    </AppLayout>
  )
}
