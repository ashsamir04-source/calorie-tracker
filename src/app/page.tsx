"use client";

import { useCallback, useEffect, useState } from "react";
import { Food, LogEntry, DailyTotals } from "@/types";
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

export default function Home() {
  const today = toDateString(new Date());
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    const res = await fetch(`/api/log?date=${today}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calorie Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div className="h-36 bg-white border border-gray-200 rounded-2xl animate-pulse" />
        ) : (
          <NutritionSummary totals={totals} />
        )}

        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Add Food</h2>
          <FoodSearch onAdd={handleAdd} />
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Today&apos;s Log
            {entries.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                {entries.length} item{entries.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white border border-gray-200 rounded-xl animate-pulse" />
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
