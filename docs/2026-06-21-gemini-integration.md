# Gemini AI Integration — 2026-06-21

## What was built

Two backend-only API routes that accept a description or photo of a meal and return structured nutrition data estimated by Gemini AI.

| Route | Input | Output |
|---|---|---|
| `POST /api/ai/nutrition-text` | `{ query: string }` | `NutritionResult` JSON |
| `POST /api/ai/nutrition-image` | `multipart/form-data` with `image` field | `NutritionResult` JSON |

Both return the same shape:
```json
{
  "food_name": "Grilled Chicken Breast with White Rice",
  "calories": 480,
  "protein": 45.2,
  "carbs": 52.0,
  "fat": 8.1,
  "serving": "350g"
}
```

The frontend was not changed in this step.

---

## Technical choices

### No SDK — raw `fetch` to the Gemini REST API

The `@google/generative-ai` npm package is the natural choice but could not be installed (no network access at build time). Instead, `src/lib/gemini.ts` calls the Gemini v1beta REST endpoint directly using the global `fetch` available in Next.js 15. This has no downsides for this use case — the REST API is stable, the request shape is simple, and there are no streaming or long-running session requirements.

If a future session has network access, `npm install @google/generative-ai` and a thin refactor of `callGemini()` in `src/lib/gemini.ts` would be a clean migration path.

### Model: `gemini-2.5-flash-lite`

Specified by the user. Fast, low-cost, and capable enough for single-turn nutrition estimation.

### Structured JSON output via `responseMimeType` + `responseSchema`

Rather than parsing free-form text, the Gemini `generationConfig` is set to `responseMimeType: "application/json"` with a `responseSchema` matching the expected fields. This guarantees the response is valid JSON conforming to the shape — no regex or regex-like parsing needed.

### Image upload: multipart form data → base64 inline

Next.js App Router's `request.formData()` is used to read the uploaded file as a `Blob`. The blob is converted to a `Buffer` and then to a base64 string, which is passed to Gemini as `inlineData`. This avoids storing the image on disk and keeps the route stateless. The 10 MB cap and MIME type allowlist are checked before calling Gemini to fail fast with a useful error status.

### Prompts are direct instructions, not few-shot examples

The prompts tell Gemini to be specific with `food_name` (e.g. "Grilled Chicken Breast with White Rice" not "meal") and to round values consistently (calories to integer, macros to one decimal). This keeps the returned data ready to display without further formatting.

---

## What was not built (and why)

| Feature | Reason |
|---|---|
| Frontend AI search UI | Explicitly deferred — do not touch frontend yet |
| Caching Gemini responses | Not needed for single-user local tool; same query is rare |
| Rate limiting | Out of scope for local dev tool |
| Streaming responses | Single-turn nutrition lookup; no benefit to streaming |

---

## File index

| File | Role |
|---|---|
| `src/lib/gemini.ts` | Gemini client — `getNutritionFromText`, `getNutritionFromImage` |
| `src/app/api/ai/nutrition-text/route.ts` | Text lookup route handler |
| `src/app/api/ai/nutrition-image/route.ts` | Image lookup route handler |
