import { useRef, useState, useEffect } from "react"

export function TooltipBriefInfo({ info }: { info: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-label="Ver información breve"
        className="ml-1 p-1 rounded-full bg-accent/80 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
      </button>
      {open && (
        <div className="absolute left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border bg-popover p-3 text-sm shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          <div className="font-semibold mb-1 text-accent">Información</div>
          <div className="whitespace-pre-line text-muted-foreground" style={{ wordBreak: 'break-word' }}>{info}</div>
        </div>
      )}
    </div>
  )
}
