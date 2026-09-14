import { useId, type ChangeEventHandler, type InputHTMLAttributes } from 'react'
import { CheckIcon } from './icons'

export type CheckboxProps = {
  label: string
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'checked' | 'onChange' | 'defaultChecked'>

export function Checkbox({ label, checked, onChange, className, ...rest }: CheckboxProps) {
  const id = useId()

  return (
    <label htmlFor={id} className={`flex items-center gap-3 cursor-pointer ${className ?? ''}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" {...rest} />
      <span
        className={`w-5 h-5 rounded flex items-center justify-center border-[1.5px] shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-line-focus ${
          checked ? 'bg-secondary border-secondary' : 'bg-surface border-line-strong'
        }`}
      >
        {checked && <CheckIcon size={14} strokeWidth={2.5} className="text-ink-inverse" />}
      </span>
      <span className="text-base text-ink">{label}</span>
    </label>
  )
}
