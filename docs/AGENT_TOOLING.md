# Agent tooling and MCP policy

> The single source of truth for what the agent may reach in this engagement.

## Client consent
- AI-assisted development permitted: **yes** — this is the repo owner's own project (no external client);
  recorded 2026-09-14 during `/setup`, by the repo owner (git user `volodymyr`).
- Restrictions: none stated. Rules C5/G1 still apply — no production environment exists yet, and none
  should be reached by the agent without it first being deliberately stood up.

## Active MCP servers
| Server | Purpose | Data it can reach | Scope/permissions | Approved by | Rotate/expire |
|--------|---------|--------------------|--------------------|-------------|---------------|
| context7 | library docs (NestJS, Prisma, Apollo, React) | none (library names only) | read | internal | — |
| serena | code navigation | this repo, locally | read | internal | — |

No GitHub, Prisma, or Playwright MCP server is installed yet — see `.mcp.json`'s notes for when to add
one (GitHub for PR/issue workflows once used; Playwright once `web/` has real screens to drive).

## Forbidden here
- Production databases, production credentials, production deploys (rule C5) — none exist yet.
- Any server not listed above.
- Shared service accounts for OAuth servers — each developer authenticates as themselves.

## Notes
- Keep ≤5 active servers per session; disable what the current task does not need.
- Prefer an already-installed CLI (`yarn`, `prisma`, `docker compose`) over an MCP server when both do the
  job — a CLI costs no context.
- Secrets only via `${ENV_VAR}` in `.mcp.json`. Never inline. `api/.env`, `api/.env.development`,
  `api/.env.test`, and each `web/packages/*/.env` are local-only and already gitignored/untracked.
