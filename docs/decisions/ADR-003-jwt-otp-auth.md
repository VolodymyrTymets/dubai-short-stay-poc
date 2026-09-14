# ADR-003 — JWT access/refresh tokens with phone-number OTP sign-in

- **Date:** 2026-09-14 (recorded retroactively, not re-litigated)
- **Status:** accepted
- **Deciders:** repo owner
- **Ticket:** —

## Context
Guests and hosts need to authenticate without a password-first flow, matching typical consumer marketplace
UX (mockups include `AuthSignUp.html`, `AuthReset.html`, `AccountVerification.html`).

## Decision
Sign-in is phone-number + OTP (`AuthService`, `OtpAuthStrategyService`, OTP hash/salt/expiry stored on
`AccountIdentity`), delivered via `NotifierModule` (a pluggable SMS-or-log strategy). On successful
verification, `JwtAuthStrategyService` issues short-lived access tokens and longer-lived refresh tokens
(`JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_EXPIRES_IN` env vars), implemented with Passport
(`@nestjs/passport`, `passport-jwt`).

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| Password-based auth | OTP-by-phone matches the target UX and avoids storing/reset-flow complexity for passwords at this stage |
| Session cookies | JWT chosen for stateless scaling across the API and future mobile/web clients |

## Consequences
- Positive: no password storage/reset complexity; works uniformly for guest and host accounts via the shared `Account`/`AccountRoleType` model.
- Accepted cost: SMS delivery is a real external dependency; currently only a log-based notifier is exercised in dev/tests.
- Follow-ups: a real SMS provider integration and its failure/retry handling need a decision before launch.

## Revisit when
A real SMS provider is chosen, or a password/email-based fallback is required.
