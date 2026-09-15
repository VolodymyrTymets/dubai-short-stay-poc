import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

export type AuthOtpInputProps = {
  length?: number
  value: string
  onChange: (value: string) => void
}

export function AuthOtpInput({ length = 6, value, onChange }: AuthOtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function digitAt(index: number) {
    const char = value[index]
    return char && char !== ' ' ? char : ''
  }

  function writeDigits(startIndex: number, digits: string) {
    const slots = value.padEnd(length, ' ').split('')
    let lastFilled = startIndex
    for (let i = 0; i < digits.length && startIndex + i < length; i++) {
      slots[startIndex + i] = digits[i]
      lastFilled = startIndex + i
    }
    onChange(slots.join('').replace(/ +$/, ''))
    return lastFilled
  }

  function clearDigit(index: number) {
    const slots = value.padEnd(length, ' ').split('')
    slots[index] = ' '
    onChange(slots.join('').replace(/ +$/, ''))
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      clearDigit(index)
      return
    }
    const lastFilled = writeDigits(index, digits)
    inputRefs.current[Math.min(lastFilled + 1, length - 1)]?.focus()
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    const lastFilled = writeDigits(index, pasted)
    inputRefs.current[Math.min(lastFilled + 1, length - 1)]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Backspace') return
    if (digitAt(index)) {
      clearDigit(index)
    } else if (index > 0) {
      clearDigit(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2.5">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digitAt(index)}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="w-14 h-16 rounded-[10px] bg-surface text-center font-serif text-[28px] font-semibold text-ink outline-none border border-line-strong focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-line-focus"
        />
      ))}
    </div>
  )
}
