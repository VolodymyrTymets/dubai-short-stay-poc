import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export type InputProps = {
  label: string
  helperText?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function Input({ label, helperText, error, prefix, suffix, className, ...rest }: InputProps) {
  const id = useId()
  const helperId = helperText || error ? `${id}-helper` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 h-12 px-3.5 rounded-lg bg-surface border ${
          error ? 'border-red-700' : 'border-line-strong'
        } focus-within:border-2 focus-within:border-line-focus`}
      >
        {prefix && <span className="text-base text-ink-muted">{prefix}</span>}
        <input
          id={id}
          aria-describedby={helperId}
          aria-invalid={Boolean(error)}
          className={`flex-1 min-w-0 text-base text-ink placeholder:text-ink-muted bg-transparent outline-none ${className ?? ''}`}
          {...rest}
        />
        {suffix && <span className="text-sm text-ink-muted">{suffix}</span>}
      </div>
      {(error || helperText) && (
        <div id={helperId} className={`text-xs ${error ? 'text-red-700' : 'text-ink-muted'}`}>
          {error ?? helperText}
        </div>
      )}
    </div>
  )
}
