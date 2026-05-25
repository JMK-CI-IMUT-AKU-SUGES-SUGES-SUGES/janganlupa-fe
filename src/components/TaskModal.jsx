import { X } from 'lucide-react'
import { useState } from 'react'

export default function TaskModal({ open, onClose }) {
  const [status, setStatus] = useState('Belum Selesai')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Tutup modal"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-brand-dark px-6 py-4">
          <h2 className="text-lg font-bold text-white">Detail Tugas</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Tandai Selesai
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Judul Tugas
            </label>
            <input
              type="text"
              defaultValue="Lorem Ipsum"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option>Belum Selesai</option>
              <option>Berjalan</option>
              <option>Selesai</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Deskripsi
            </label>
            <textarea
              rows={4}
              defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Pengumpulan
            </label>
            <div className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-muted transition-colors hover:border-brand hover:bg-brand/5">
              Upload or Drag File
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
