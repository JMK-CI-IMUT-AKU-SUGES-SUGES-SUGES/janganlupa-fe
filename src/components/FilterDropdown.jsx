import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

function getMultiSelectSummary(options, selectedValues, allLabel, emptyLabel) {
  if (selectedValues.length === options.length) return allLabel

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  )

  if (selectedOptions.length === 0) return emptyLabel
  if (selectedOptions.length <= 2) {
    return selectedOptions.map((option) => option.label).join(', ')
  }

  return `${selectedOptions.length} dipilih`
}

function getSingleSelectSummary(options, selectedValue, emptyLabel) {
  return options.find((option) => option.value === selectedValue)?.label ?? emptyLabel
}

function getOptionTone(isSelected) {
  return isSelected
    ? 'border-brand/20 bg-blue-50/80 text-brand-navy'
    : 'border-slate-100 bg-white text-brand-navy hover:border-brand/15 hover:bg-blue-50/50'
}

const FilterDropdown = memo(function FilterDropdown({
  label,
  options,
  value,
  values,
  multiple = false,
  onChange,
  onToggleOption,
  onSelectAll,
  allLabel = 'Semua',
  emptyLabel = 'Belum dipilih',
  minSelectedCount = 0,
  triggerClassName = '',
  panelClassName = '',
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selectedValues = useMemo(() => values ?? [], [values])
  const summaryLabel = useMemo(
    () =>
      multiple
        ? getMultiSelectSummary(options, selectedValues, allLabel, emptyLabel)
        : getSingleSelectSummary(options, value, emptyLabel),
    [allLabel, emptyLabel, multiple, options, selectedValues, value]
  )

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition ${
          open
            ? 'border-brand/30 ring-4 ring-brand/10'
            : 'border-slate-200 hover:border-brand/20'
        } ${triggerClassName}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-brand-navy">
            {summaryLabel}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div
          className={`absolute left-0 top-[calc(100%+12px)] z-40 w-full min-w-[280px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70 sm:left-auto sm:right-0 sm:w-[280px] ${panelClassName}`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-brand-navy">{label}</p>
            {multiple && onSelectAll ? (
              <button
                type="button"
                onClick={onSelectAll}
                className="cursor-pointer text-xs font-bold text-brand transition hover:text-brand-navy"
              >
                Pilih semua
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = multiple
                ? selectedValues.includes(option.value)
                : value === option.value
              const isLocked =
                multiple &&
                isSelected &&
                minSelectedCount > 0 &&
                selectedValues.length <= minSelectedCount

              if (multiple) {
                return (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition ${
                      getOptionTone(isSelected)
                    } ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{option.label}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isLocked}
                      onChange={() => onToggleOption?.(option.value)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand focus:ring-brand/20 disabled:cursor-not-allowed"
                    />
                  </label>
                )
              }

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${getOptionTone(
                    isSelected
                  )}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{option.label}</p>
                  </div>
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-200 bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
})

export default FilterDropdown
