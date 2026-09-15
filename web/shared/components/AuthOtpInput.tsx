import { useRef, type KeyboardEvent } from 'react'

export type AuthOtpInputProps = {
  length?: number
  value: string
  onChange: (value: string) => void
}

export function AuthOtpInput({ length = 6, value, onChange }: AuthOtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = value.split('')
    next[index] = digit
    const joined = next.join('').slice(0, length)
    onChange(joined)
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2.5">
      {Array.from({ length }).map((_, index) => {
        const active = index === value.length
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[index] ?? ''}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-14 h-16 rounded-[10px] bg-surface text-center font-serif text-[28px] font-semibold text-ink outline-none ${
              active ? 'border-2 border-line-focus' : 'border border-line-strong'
            }`}
          />
        )
      })}
    </div>
  )
}
