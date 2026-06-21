"use client";

import { useRef, useState } from "react";
import { Food } from "@/types";
import { FOODS } from "@/data/foods";

interface NutritionResult {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface Props {
  onAdd: (food: Food) => void;
}

export default function FoodSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState<NutritionResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? FOODS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : FOODS;

  function clearAi() {
    setAiResult(null);
    setAiError(null);
  }

  function resultToFood(r: NutritionResult): Food {
    return {
      id: "ai-" + Date.now(),
      name: r.food_name,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      serving: r.serving,
    };
  }

  async function askAiText() {
    if (!query.trim() || aiLoading) return;
    setAiLoading(true);
    clearAi();
    try {
      const res = await fetch("/api/ai/nutrition-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI lookup failed");
      setAiResult(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAiLoading(true);
    clearAi();
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/ai/nutrition-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image analysis failed");
      setAiResult(data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div>
      {/* Search bar + camera button */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search foods or describe a meal…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); clearAi(); }}
            onKeyDown={(e) => { if (e.key === "Enter") askAiText(); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); clearAi(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={aiLoading}
          title="Analyse a meal photo with AI"
          className="flex items-center justify-center w-10 h-10 shrink-0 border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-emerald-600 hover:border-emerald-400 transition-all disabled:opacity-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* AI loading */}
      {aiLoading && (
        <div className="mb-4 flex items-center gap-2.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Analysing with AI…
        </div>
      )}

      {/* AI error */}
      {aiError && (
        <div className="mb-4 flex items-center justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span>{aiError}</span>
          <button onClick={clearAi} className="ml-3 text-red-400 hover:text-red-600 text-base leading-none">×</button>
        </div>
      )}

      {/* AI result card */}
      {aiResult && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1.5">
              AI estimate
            </span>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{aiResult.food_name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {aiResult.serving} · {aiResult.calories} kcal · P {aiResult.protein}g · C {aiResult.carbs}g · F {aiResult.fat}g
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={() => { onAdd(resultToFood(aiResult)); clearAi(); setQuery(""); }}
              className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add
            </button>
            <button onClick={clearAi} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Food grid (hidden while AI result is shown) */}
      {!aiResult && (
        filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">No foods match &ldquo;{query}&rdquo;</p>
            <button
              onClick={askAiText}
              disabled={aiLoading}
              className="text-sm text-emerald-600 border border-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-40"
            >
              Ask AI about &ldquo;{query}&rdquo;
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map((food) => (
                <button
                  key={food.id}
                  onClick={() => onAdd(food)}
                  className="text-left bg-white border border-gray-200 rounded-xl p-3 hover:border-emerald-400 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 leading-tight">{food.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{food.serving}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{food.calories} <span className="text-xs font-normal text-gray-400">kcal</span></p>
                </button>
              ))}
            </div>
            {query.trim() && (
              <button
                onClick={askAiText}
                disabled={aiLoading}
                className="mt-3 text-xs text-gray-400 hover:text-emerald-600 transition-colors w-full text-center disabled:opacity-40"
              >
                Not what you meant? Ask AI about &ldquo;{query}&rdquo; →
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
