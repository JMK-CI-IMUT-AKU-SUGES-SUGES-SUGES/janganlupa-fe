import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const modalTransitionMs = 260

export default function GlobalModal({
  open,
  onClose,
  children,
  widthClassName = 'max-w-2xl',
}) {
  const [isMounted, setIsMounted] = useState(open)
  const [isVisible, setIsVisible] = useState(false)
  const frameRef = useRef(0)
  const timeoutRef = useRef(0)

  useEffect(() => {
    window.clearTimeout(timeoutRef.current)
    window.cancelAnimationFrame(frameRef.current)

    if (open) {
      frameRef.current = window.requestAnimationFrame(() => {
        setIsMounted(true)
        frameRef.current = window.requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
      return undefined
    }

    frameRef.current = window.requestAnimationFrame(() => {
      setIsVisible(false)
    })
    timeoutRef.current = window.setTimeout(() => {
      setIsMounted(false)
    }, modalTransitionMs)

    return () => {
      window.clearTimeout(timeoutRef.current)
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  if (typeof document === 'undefined' || !isMounted) return null

  return createPortal(
    <div
      aria-hidden={!isVisible}
      data-open={isVisible ? 'true' : 'false'}
      className="global-modal-root"
    >
      <button
        type="button"
        aria-label="Tutup modal"
        className="global-modal-backdrop"
        onClick={() => onClose?.()}
      />
      <div role="dialog" aria-modal="true" className={`global-modal-panel ${widthClassName}`}>
        {children}
      </div>
    </div>,
    document.body
  )
}
