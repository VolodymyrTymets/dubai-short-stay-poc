export type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label': string
}

export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full p-0.5 flex shrink-0 transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus ${
        checked ? 'justify-end bg-secondary' : 'justify-start bg-line-strong'
      }`}
      {...rest}
    >
      <span className="w-5 h-5 rounded-full bg-surface shadow-pill" />
    </button>
  )
}
