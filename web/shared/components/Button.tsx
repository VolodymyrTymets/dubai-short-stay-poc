import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon'
export type ButtonSize = 'lg' | 'md' | 'sm'

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Trailing icon slot — ignored when variant="icon" (the icon itself is `children`). */
  icon?: ReactNode
  /** variant="icon" only: draws the neutral border (default true; the "close"-style icon button omits it). */
  bordered?: boolean
  children?: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-line-focus'

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'h-12 px-6 text-base gap-2',
  md: 'h-10 px-5 text-sm gap-2',
  sm: 'h-8 px-3.5 text-sm gap-2',
}

const variantClasses: Record<Exclude<ButtonVariant, 'icon'>, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary-hover',
  outline: 'bg-surface text-ink border border-line-strong hover:bg-subtle',
  ghost: 'bg-transparent text-ink hover:bg-subtle',
  danger: 'bg-surface text-red-700 border border-line-strong hover:bg-red-50',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  bordered = true,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const base = `inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none ${focusRing}`

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`${base} w-10 h-10 shrink-0 bg-surface text-ink ${bordered ? 'border border-line' : ''} rounded-full ${className ?? ''}`}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ''}`}
      disabled={disabled}
      {...rest}
    >
      {children}
      {icon}
    </button>
  )
}
