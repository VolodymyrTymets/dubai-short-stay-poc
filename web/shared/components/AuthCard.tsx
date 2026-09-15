import { useState } from 'react'
import { Link } from 'react-router'
import { Input } from './Input'
import { Checkbox } from './Checkbox'
import { Button } from './Button'
import { AuthOtpInput } from './AuthOtpInput'
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, MailIcon, XIcon } from './icons'

export type AuthCardProps = {
  activeTab: 'login' | 'signup'
}

type Step = 'form' | 'confirm'

export function AuthCard({ activeTab }: AuthCardProps) {
  const [step, setStep] = useState<Step>('form')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [code, setCode] = useState('')

  function handleSubmitForm() {
    setStep('confirm')
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="w-full max-w-[568px] rounded-2xl bg-surface shadow-card overflow-hidden">
        {step === 'form' ? (
          <>
            <div className="h-16 px-5 flex items-center justify-between border-b border-line">
              <Link
                to="/"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-ink hover:bg-subtle"
                aria-label="Back to home"
              >
                <XIcon size={18} />
              </Link>
              <span className="text-base font-semibold text-ink">Log in or sign up</span>
              <div className="w-10" />
            </div>
            <div className="px-8 pt-7 pb-8 flex flex-col gap-5">
              <h2 className="font-serif text-3xl font-semibold text-ink">Welcome to DubaiShortStay</h2>

              <div className="flex p-1 rounded-[10px] bg-stone-100">
                <Link
                  to="/sign-in"
                  className={`flex-1 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    activeTab === 'login' ? 'bg-surface text-ink shadow-sm' : 'text-stone-600'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/sign-up"
                  className={`flex-1 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    activeTab === 'signup' ? 'bg-surface text-ink shadow-sm' : 'text-stone-600'
                  }`}
                >
                  Sign up
                </Link>
              </div>

              {activeTab === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    placeholder="Layla"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                  <Input
                    label="Last name"
                    placeholder="Ahmed"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="layla.ahmed@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                helperText={activeTab === 'signup' ? 'At least 10 characters with a number and a symbol.' : undefined}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-ink-muted"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                }
              />

              {activeTab === 'signup' && (
                <Checkbox
                  label="Email me stay ideas and offers"
                  checked={marketingOptIn}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                />
              )}

              <Button variant="primary" size="lg" className="w-full" onClick={handleSubmitForm}>
                {activeTab === 'signup' ? 'Create account' : 'Log in'}
              </Button>

              <p className="text-xs text-ink-muted">
                By continuing you agree to the{' '}
                <button type="button" className="underline text-ink-muted">
                  Terms of Service
                </button>{' '}
                and acknowledge the{' '}
                <button type="button" className="underline text-ink-muted">
                  Privacy Policy
                </button>{' '}
                (UAE PDPL).
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 px-5 flex items-center justify-between border-b border-line">
              <button
                type="button"
                onClick={() => setStep('form')}
                aria-label="Back"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-ink hover:bg-subtle"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <span className="text-base font-semibold text-ink">Confirm your email</span>
              <div className="w-10" />
            </div>
            <div className="px-8 py-8 flex flex-col gap-6 items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center">
                <MailIcon size={28} className="text-gold-700" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-serif text-3xl font-semibold text-ink">Check your inbox</h2>
                <p className="text-base text-ink-secondary">
                  Enter the 6-digit code we sent to <b className="text-ink">{email || 'your email'}</b>
                </p>
              </div>
              <AuthOtpInput value={code} onChange={setCode} />
              <Button variant="primary" size="lg" className="w-full">
                Verify email
              </Button>
              <p className="text-sm text-ink-muted">
                Didn't get it?{' '}
                <button type="button" disabled className="text-ink underline disabled:opacity-50">
                  Resend code
                </button>{' '}
                in 0:42
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
