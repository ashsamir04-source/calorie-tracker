# Calorie Tracker

A single-page web app for tracking daily calories and macronutrients. No login, no accounts — just open it and start logging.

## What it does

- Search or browse 24 common foods and click to add them to today's log
- Daily totals banner shows calories consumed vs. goal (2000 kcal), plus protein, carbs, and fat
- Food log persists across page refreshes via a local JSON file database
- Remove individual log entries with the × button

## How to run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Persistence | JSON file via Node.js `fs` (no external DB) |
| Runtime | Node.js (any version) |

## Folder structure

```
src/
  app/
    api/
      log/
        route.ts              GET /api/log?date=  POST /api/log
        [id]/route.ts         DELETE /api/log/:id
      ai/
        nutrition-text/
          route.ts            POST /api/ai/nutrition-text
        nutrition-image/
          route.ts            POST /api/ai/nutrition-image
    globals.css
    layout.tsx
    page.tsx                  Client component — all state lives here
  components/
    NutritionSummary.tsx      Daily totals banner
    FoodSearch.tsx            Search bar + food grid
    FoodLog.tsx               Today's entries list
  data/
    foods.ts                  24 hardcoded foods with macros
  lib/
    db.ts                     JSON file read/write helpers
    gemini.ts                 Gemini REST client (getNutritionFromText, getNutritionFromImage)
  types/
    index.ts                  Shared interfaces (Food, LogEntry, DailyTotals)

database/               Created at runtime, gitignored
  log.json
docs/
  2026-06-21-initial-build.md
  2026-06-21-gemini-integration.md
```

## AI API routes

Both routes are backend-only. They call the Gemini REST API (`gemini-2.5-flash-lite`) and return:

```json
{ "food_name": "...", "calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "serving": "..." }
```

### POST /api/ai/nutrition-text

Body: `{ "query": "grilled chicken with rice and salad" }`

Sends a text prompt to Gemini and returns estimated nutrition for one typical serving.

### POST /api/ai/nutrition-image

Body: `multipart/form-data` with an `image` field (JPEG, PNG, WebP, GIF, HEIC; max 10 MB).

Converts the image to base64, sends it to Gemini vision, returns estimated nutrition for the portion shown.

## Environment variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini REST API key — required for `/api/ai/*` routes |

## What's coming next

- [ ] Connect AI routes to the frontend (search bar + image upload button)
- [ ] Date navigation (view past days)
- [ ] Custom serving size input
- [ ] Weekly summary chart
- [ ] Custom food creation
