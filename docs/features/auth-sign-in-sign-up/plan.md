# auth-sign-in-sign-up — implementation plan

<!-- A human writes this line to approve. Until it is here, guard-plan-approval blocks writes to code.
     A deliberate exception is written the same way, with its reason:
     Approved-by: spike, no review — auth-sign-in-sign-up -->
Approved-by: volodymyr · 2026-09-15

Pattern followed: `web/shared/components/` (ADR-007) for the new shared primitives — `Input.tsx`,
`Checkbox.tsx`, `Button.tsx` (variant="primary") and `Logo.tsx` already match `AuthSignUp.html`'s fields,
checkbox and gold CTA almost exactly and are reused unchanged. The tab switcher is a **new** segmented-pill
visual (not the existing underline `Tabs.tsx` in `web/shared/components/Tabs.tsx` — different shape,
first use) and the 6-box OTP input is also new — both land in `web/shared/components/` directly because,
per ADR-006/`frontend-react.md` rule 9, they have two real consumers on day one (`guest` and `host`), not
one. Routing precedent: `web-page-layout`'s `router.tsx` (ADR-008) already wires `/sign-in`/`/sign-up` as
children of each app's `Layout` — unchanged here, only the page bodies are implemented.

Branch: current branch `sign-page` has not diverged from `main` yet — switch to `feat/auth-sign-in-sign-up`
before implementing (rule A1).

## Contract changes
- boundary: none — no GraphQL/API surface touched (UI only, explicitly out of scope per spec.md).
- data: none.
- generated output: none regenerated.
- shared surface: `web/shared/components/AuthCard.tsx` and `AuthOtpInput.tsx` are new additive exports.
  No existing shared component's props/shape change.

## Requirements (ordered, each independently verifiable)

### R1 — `AuthCard` + `AuthOtpInput` in `web/shared/components/`, wired into `guest` (M)
- files: `web/shared/components/AuthOtpInput.tsx` (new — the 6-box code row: controlled `value: string`,
  `onChange`, auto-advances focus to the next box on digit entry, per spec.md's edge-case table),
  `web/shared/components/AuthCard.tsx` (new — internal `'login' | 'signup' | 'confirm'` state; renders the
  segmented Log in/Sign up tab pill, the log-in form (email, password w/ show/hide toggle, "Log in"), the
  sign-up form (first/last name, email, password w/ toggle + helper text, marketing checkbox, "Create
  account"), and the confirm-email panel (`AuthOtpInput` + "Verify email" + static "Resend code in 0:42"
  text) — tab clicks are `react-router` `Link`s to `/sign-in`/`/sign-up` so the URL tracks the tab; takes an
  `activeTab: 'login' | 'signup'` prop driven by the current route, not owned internally, so `SignInPage`/
  `SignUpPage` stay the source of truth), `web/packages/guest/src/pages/SignInPage.tsx` (change: renders
  `<AuthCard activeTab="login" />`, replacing the TODO), `web/packages/guest/src/pages/SignUpPage.tsx`
  (same, `activeTab="signup"`)
- layer: web UI — `AuthCard`/`AuthOtpInput` are `web/shared/`, the two page files are `guest`-local
- test: none (no test runner configured for `web/`, per `CLAUDE.md`)
- executed how: `yarn dev:guest`, open `http://localhost:3000/sign-in` and `/sign-up` in a real browser;
  confirm the card matches `AuthSignUp.html`'s spacing/type/colors (not its dark overlay — `Layout` already
  supplies chrome), confirm tab click navigates between the two routes, confirm "Create account"/"Log in"
  switches to the confirm-email panel, confirm OTP box auto-advance and password show/hide work, confirm no
  console errors; `(cd web && yarn build:all)` passes; screenshot each of the 3 states
- risk: the log-in form has no source mockup (spec.md open question #2) — built symmetrical to sign-up;
  flag for follow-up if design later specifies something different

### R2 — Wire `host`'s `SignInPage`/`SignUpPage` to the same `AuthCard` (S)
- files: `web/packages/host/src/pages/SignInPage.tsx` (change: renders `<AuthCard activeTab="login" />`),
  `web/packages/host/src/pages/SignUpPage.tsx` (same, `activeTab="signup"`)
- layer: web UI, `host`-local
- test: none (no test runner configured for `web/`)
- executed how: `yarn dev:host`, open `http://localhost:3002/sign-in` and `/sign-up`; confirm the card
  renders identically to `guest`'s (inside `host`'s `Sidebar`/`Topbar` chrome instead), same checks as R1,
  no console errors; `(cd web && yarn build:all)` passes; screenshot each of the 3 states
- risk: none — `AuthCard` takes no `guest`/`host`-specific props, this is a thin render-only wire-up

## Docs to update in this PR
- [ ] docs/features/auth-sign-in-sign-up/spec.md (acceptance criteria checked off)
- [ ] docs/ARCHITECTURE.md — "Known constraints and landmines" currently says `Home`/`Sign In`/`Sign Up`
      are "empty stub pages — no real screen content yet"; update once `Sign In`/`Sign Up` have real UI
      (rule E2 — this goes stale the moment this PR lands)
- [ ] docs/DOMAIN_GLOSSARY.md — not touched; no new domain nouns (form field names are UI, not domain terms)
- [ ] docs/decisions/ADR-NNN — none; this follows ADR-006/007/008 as already-settled precedent, no new
      architectural pattern is introduced

## Risks
| Risk | Impact | Cheapest way to find out early |
|------|--------|-------------------------------|
| Password fields conflict with the documented OTP-only backend flow (spec.md OQ1) | The password field/UI may be partly thrown away or reworked when the real mutation is wired next ticket | Already accepted by the user for this UI-only pass; re-confirm scope with whoever picks up the query-wiring ticket before they start |
| No mockup for the "Log in" tab's own content (spec.md OQ2) | Built form may not match a not-yet-seen design | Cheap to adjust later — it's a small, isolated form inside `AuthCard` |
| `AuthOtpInput`'s auto-advance-focus behaviour is new interaction code with no existing precedent in this repo | Minor UX bugs (e.g. backspace/paste handling) possible on first pass | Manual keyboard testing in the browser during R1's execution step, before moving to R2 |
| No i18n library is installed (`BUSINESS_MODEL.md`'s explicit out-of-scope call); this is the first screen shipping real, hardcoded English UI copy (labels, helper text, button/tab text) | Every string in `AuthCard` would need extraction later if/when i18n is adopted | Flagging now per rule D7 rather than building a translation layer speculatively — no action needed this ticket |

## Assumptions
- Log-in form = email + password + "Log in" button, styled identically to the sign-up form's fields
  (spec.md OQ2's assumed answer).
- "Confirm your email" panel is shared by both the log-in and sign-up flows (the mockup only shows it once,
  reached from "Create account"; reusing it for "Log in" too avoids a second near-identical panel).
- Password show/hide toggle and OTP auto-advance count as UI-only interaction state, not "real logic" —
  consistent with spec.md's edge-case table, since neither calls an API or validates anything.
- `react-hook-form`/`zod` (`CLAUDE.md`'s stated default "when the first form ships") are deliberately
  deferred, not rejected — this pass has no submission/validation logic to justify adding a new dependency
  (rule C2); the follow-up ticket that wires real mutations should adopt them then.
