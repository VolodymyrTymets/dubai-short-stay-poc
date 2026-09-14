import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-serif text-3xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-7 ${className ?? ''}`}>{children}</div>
}
