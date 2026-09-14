import { useId, type InputHTMLAttributes } from 'react'

export type RadioProps = {
  label: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'>

export function Radio({ label, checked, className, ...rest }: RadioProps) {
  const id = useId()

  return (
    <label htmlFor={id} className={`flex items-center gap-2.5 cursor-pointer ${className ?? ''}`}>
      <input id={id} type="radio" checked={checked} className="peer sr-only" {...rest} />
      <span
        className={`w-5 h-5 rounded-full bg-surface shrink-0 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-line-focus ${
          checked ? 'border-[6px] border-secondary' : 'border-[1.5px] border-line-strong'
        }`}
      />
      <span className="text-base text-ink">{label}</span>
    </label>
  )
}
