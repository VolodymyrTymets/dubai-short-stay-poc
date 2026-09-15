# auth-sign-in-sign-up — Sign In & Sign Up UI (guest + host)

## Problem
`guest` and `host` both already route to `/sign-in` and `/sign-up` (landed in `web-page-layout`), but each
page is a `// TODO:` stub that renders `null`. A `Guest`/`Host` cannot see any sign-in or sign-up form today
in either app.

## Goal / business value
Serves ranked goal #1 (`BUSINESS_MODEL.md`) — wiring the next real screen end-to-end (visually) beats
leaving a routed dead end, and goal #3 — the form is genuinely needed by both `guest` and `host` on day one,
so it belongs in `web/shared/` per ADR-006/`frontend-react.md` rule 9 rather than being duplicated.

## Scope
- in: a shared `AuthCard` component (`web/shared/components/`) rendering the "Log in" / "Sign up" segmented
  tab switcher, the sign-up form (first name, last name, email, password, marketing checkbox, "Create
  account"), a log-in form (email, password, "Log in"), and the "Confirm your email" 6-digit OTP-code panel
  — all styled from `designs/dss-v1-web-mockups-html/AuthSignUp.html`'s tokens (already 1:1 with
  `web/shared/theme.css`).
- in: `SignInPage`/`SignUpPage` in both `web/packages/guest/src/pages/` and `web/packages/host/src/pages/`
  render `AuthCard` inside each app's existing `Layout` chrome (no full-screen overlay — the raw mockup's
  `rgba(13,31,53,0.55)` backdrop is not reproduced, `Layout` already supplies page chrome/background).
- in: switching the tab navigates between `/sign-in` and `/sign-up` (via `react-router`'s `Link`, ADR-008)
  so the URL and the visible tab stay in sync.
- in: form fields are interactive (local `useState`, typeable, the checkbox toggles) for visual/UX review.
- **out (explicit):** no GraphQL query/mutation wiring — buttons do not call `signInOtp`/`verifyOtp` or any
  other API. No react-hook-form/zod validation. No real OTP send/verify/resend/countdown logic — the code
  boxes are static, non-submitting inputs. No "Forgot password" / password-reset page (`AuthReset.html`) —
  out of scope for this ticket, a future one if a password-based reset is still needed once AC/OQ1 below is
  resolved. No changes to `api/`.

## Acceptance criteria
- [ ] AC1 Given a visitor on `guest` at `/sign-in`, when the page loads, then it shows the auth card with
      the "Log in" tab active, inside the guest `Header`/`Footer` chrome, matching `AuthSignUp.html`'s
      typography/spacing/colors for the card itself (not its overlay).
- [ ] AC2 Given the same visitor clicks the "Sign up" tab (or navigates to `/sign-up` directly), then the
      form shows first name, last name, email, password (with the "At least 10 characters..." helper text),
      the marketing checkbox, and a "Create account" button — matching `AuthSignUp.html` exactly.
- [ ] AC3 Given a visitor clicks "Create account" (or "Log in"), then the card switches to the "Confirm your
      email" panel with 6 individual code boxes and a "Verify email" button, addressed to the email just
      typed into the form — matching `AuthSignUp.html`'s second panel. No network call happens.
- [ ] AC4 The same three states (log in / sign up / confirm) render identically in `host` at its own
      `/sign-in` and `/sign-up`, inside `host`'s `Sidebar`/`Topbar` chrome instead of guest's.
- [ ] AC5 All colors/fonts come from `web/shared/theme.css` tokens (`bg-primary`, `text-ink`,
      `border-line-strong`, `font-serif`, etc.) — no hardcoded hex from the mockup HTML.
- [ ] AC6 No console errors/warnings in either app on `/sign-in` or `/sign-up`; `yarn build:all` passes.

## Edge cases
| Case | Expected behaviour | Decided by |
|------|--------------------|-----------|
| Password field visibility toggle (mockup shows an eye icon) | Icon renders (matches mockup); clicking it toggles `type="text"`/`type="password"` — this is pure UI state, no scope conflict with "no real logic" | this plan |
| OTP code boxes | Typing a digit in a box auto-advances focus to the next box (matches the mockup's implied UX); no validation, no submit-on-complete | this plan |
| Resend code / countdown ("Resend code in 0:42") | Rendered as static text, not a live timer — a real timer implies logic this ticket excludes | this plan |
| Tab switch while mid-way through the OTP confirm panel | Switching tabs resets back to the log-in/sign-up form (no persisted cross-tab confirm state) — simplest behaviour, nothing in scope depends on preserving it | this plan |

## Open questions
| # | Question | My assumed answer | Needs a human? |
|---|----------|-------------------|----------------|
| 1 | `AuthSignUp.html` uses password fields; `ARCHITECTURE.md` flow 1 and the existing `SignInPage`/`SignUpPage` TODOs describe OTP-only auth (no password) via `AuthService`/`OtpAuthStrategyService` | User explicitly chose mockup fidelity (password fields) for this UI-only pass; reconciling with the real OTP-only mutation shape is deferred to the follow-up ticket that wires the queries | Already answered by the user this session — recorded here for the record, not re-asked |
| 2 | Mockup has no dedicated "Log in" tab content (only "Sign up" is shown active) | Build a symmetrical log-in form: email + password + "Log in" button, same field/button styling as sign-up, since no separate mockup file exists for it | No — smallest reasonable inference from the shown design tokens; flagged here for visibility |
