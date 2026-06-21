# Initial Build — 2026-06-21

## What was built

A complete single-page calorie tracker web app built from an empty folder. The app lets users click common foods to add them to a daily log, see real-time calorie and macro totals, and remove entries — all persisting across page refreshes.

### Features shipped

- **NutritionSummary** banner: calorie progress bar (goal: 2000 kcal), protein / carbs / fat breakdown
- **FoodSearch**: client-side filtered grid of 24 foods, search clears with × button
- **FoodLog**: ordered list of today's entries with per-entry macros and remove button
- **REST API**: `GET /api/log`, `POST /api/log`, `DELETE /api/log/[id]`
- **Persistence**: JSON file at `database/log.json`, auto-created on first request

---

## Technical choices

### Next.js 15 (App Router) + TypeScript
Chosen for its file-based routing, built-in API routes, and TypeScript support out of the box. The App Router lets API routes and the page share the same repo with no extra server setup.

### Tailwind CSS v4
Minimal configuration — v4's `@import "tailwindcss"` in globals.css is all that's needed. No tailwind.config.ts customization required for this scope.

### JSON file for persistence (instead of SQLite)
`better-sqlite3` (the original plan) failed to compile because Node v21.7.2 is not in its supported range and the Windows SDK 10.0.19041.0 was absent. Switched to reading/writing a plain JSON file using Node's built-in `fs` module. This has zero dependencies, compiles on any Node version, and fully meets the requirement: data persists across page refreshes. The tradeoff is that concurrent writes from multiple browser tabs could theoretically interleave — acceptable for a single-user local tool.

### State in page.tsx (no Redux / Zustand)
Three components, one shared state, no async complexity beyond fetch calls. `useState` + `useEffect` in the root page component is the right scope for this.

### All foods hardcoded in `src/data/foods.ts`
Avoids a seed step, keeps the startup experience instant. 24 foods is enough to demonstrate the pattern; AI-powered search (Gemini) is the natural next step to expand coverage.

### `database/` gitignored
The JSON log file is machine-local data, not source code. It should never be committed.

---

## What was not built (and why)

| Feature | Reason |
|---|---|
| Date navigation | Out of scope for v1; always shows today |
| Custom serving sizes | Adds input complexity; click-to-add is faster for v1 |
| Auth / accounts | Explicitly excluded by requirements |
| AI food search | `GEMINI_API_KEY` is in `.env` — reserved for v2 |
