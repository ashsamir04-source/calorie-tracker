"use client";

import { useCallback, useEffect, useState } from "react";
import { Food, LogEntry, DailyTotals, MealCategory } from "@/types";
import NutritionSummary from "@/components/NutritionSummary";
import FoodSearch from "@/components/FoodSearch";
import FoodLog from "@/components/FoodLog";

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function sumTotals(entries: LogEntry[]): DailyTotals {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

const MEAL_CATEGORIES: { label: MealCategory; emoji: string }[] = [
  { label: "Breakfast", emoji: "🌅" },
  { label: "Lunch",     emoji: "☀️" },
  { label: "Dinner",    emoji: "🌙" },
  { label: "Snack",     emoji: "🍎" },
];

const MEAL_ACTIVE: Record<MealCategory, string> = {
  Breakfast: "bg-amber-500 text-white border-amber-500",
  Lunch:     "bg-sky-500 text-white border-sky-500",
  Dinner:    "bg-violet-500 text-white border-violet-500",
  Snack:     "bg-emerald-500 text-white border-emerald-500",
};

const MEAL_INACTIVE: Record<MealCategory, string> = {
  Breakfast: "border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50",
  Lunch:     "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50",
  Dinner:    "border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50",
  Snack:     "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50",
};

function getDefaultMeal(): MealCategory {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 17) return "Snack";
  return "Dinner";
}

export default function Home() {
  const today = toDateString(new Date());
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(getDefaultMeal);

  const fetchLog = useCallback(async () => {
    try {
      const res = await fetch(`/api/log?date=${today}`);
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      // leave entries as empty array on network/parse failure
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  async function handleAdd(food: Food) {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        meal: selectedMeal,
        food_name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        serving: food.serving,
      }),
    });
    await fetchLog();
  }

  async function handleRemove(id: number) {
    await fetch(`/api/log/${id}`, { method: "DELETE" });
    await fetchLog();
  }

  const totals = sumTotals(entries);

  return (
    <main className="min-h-screen bg-[#F5F7F5]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <header className="flex items-center gap-3 pb-1">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">Calorie Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </header>

        {/* Summary */}
        {loading ? (
          <div className="h-52 bg-white border border-gray-200 rounded-2xl animate-pulse" />
        ) : (
          <NutritionSummary totals={totals} />
        )}

        {/* Add Food */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Food</h2>

          {/* Meal tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {MEAL_CATEGORIES.map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => setSelectedMeal(label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedMeal === label ? MEAL_ACTIVE[label] : MEAL_INACTIVE[label]
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          <FoodSearch onAdd={handleAdd} />
        </section>

        {/* Today's Log */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Today&apos;s Log</h2>
            {entries.length > 0 && (
              <span className="text-xs text-gray-400">
                {entries.length} item{entries.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-white border border-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <FoodLog entries={entries} onRemove={handleRemove} />
          )}
        </section>
      </div>
    </main>
  );
}
