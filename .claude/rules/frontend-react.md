---
description: React / web rules - state ownership, effects, components, forms, styling tokens, framework boundaries, performance, accessibility.
paths:
  - "web/packages/*/src/**"
  - "**/*.tsx"
---

# Frontend rules (React)

## State

1. **Server state lives in the data layer** (Apollo Client). Never mirror server data into Redux/Zustand/Context. *Why: two sources of truth for the same row is the most common bug class in our web projects.*
2. **Never fetch in `useEffect`** when the data layer exists.
3. A `useEffect` that only syncs state to state must be deleted. Effects are for real side effects: subscriptions, DOM, timers, non-React systems.
4. **Derived state is computed during render**, never stored.
5. Every list item has a stable domain key. Index keys only for static, non-reorderable lists.

## Components

6. One component per file. Props typed explicitly. No `React.FC<any>`. No prop drilling deeper than two levels — use composition or context.
7. **Every data-driven view implements four states**: loading, empty, error (with retry), success. A view without them is unfinished.
8. Forms use react-hook-form + zod resolver (no form library is installed yet — add it when the first form ships, don't hand-roll validation). The schema is shared with the API types where a shared package exists.
9. Do not extract a component until it is used twice or the file passes ~150 lines.

## Styling

10. Styling comes from the **design tokens** only — `web/shared/theme.css` (Tailwind v4 `@theme{}` tokens for fonts/colors/shadows, imported by each app's `src/index.css`). No hardcoded hex colours, spacings or font sizes outside that token layer.
11. Pull tokens and spacing from the design MCP rather than eyeballing a screenshot.

## Framework boundaries

12. This is a plain Vite SPA, not Next.js/RSC — there is no server/client component boundary to manage. `guest` and `web/packages/host` are independent apps; only `web/shared/` code may be imported by both, never one app's `src/` from the other's.

## Performance

13. **No premature `useMemo`/`useCallback`/`memo`.** Profile first (React DevTools or the browser MCP), then optimise, then report before/after numbers.
14. Heavy dependencies are dynamically imported. Report the bundle delta for any new dependency.

## Accessibility

15. Baseline on every view: semantic elements, labelled inputs, visible focus, keyboard-operable controls, focus trap and restore for dialogs.
16. Never disable the React hooks or `exhaustive-deps` lint rules to silence a warning (rule B3).

## Verification (rule B1)

A web change is done only after the page was **opened in a real browser** and the changed view exercised — success, empty and error paths — with a screenshot per claimed state and no new console errors.
