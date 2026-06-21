"use client";

import { LogEntry, MealCategory } from "@/types";

interface Props {
  entries: LogEntry[];
  onRemove: (id: number) => void;
}

const MEAL_ORDER: MealCategory[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MEAL_META: Record<
  MealCategory,
  { emoji: string; label: string; accent: string; text: string }
> = {
  Breakfast: { emoji: "🌅", label: "Breakfast", accent: "bg-amber-400", text: "text-amber-700" },
  Lunch:     { emoji: "☀️", label: "Lunch",     accent: "bg-sky-400",   text: "text-sky-700" },
  Dinner:    { emoji: "🌙", label: "Dinner",    accent: "bg-violet-400", text: "text-violet-700" },
  Snack:     { emoji: "🍎", label: "Snack",     accent: "bg-emerald-400",text: "text-emerald-700" },
};

export default function FoodLog({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">Nothing logged yet</p>
        <p className="text-xs text-gray-400 mt-1">Search for a food above to get started</p>
      </div>
    );
  }

  const grouped: Record<MealCategory, LogEntry[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  };
  for (const entry of entries) {
    const meal = (entry.meal as MealCategory) || "Snack";
    grouped[meal].push(entry);
  }

  const activeSections = MEAL_ORDER.filter((m) => grouped[m].length > 0);

  return (
    <div className="space-y-6">
      {activeSections.map((meal) => {
        const section = grouped[meal];
        const meta = MEAL_META[meal];
        const sectionCals = section.reduce((s, e) => s + e.calories, 0);

        return (
          <div key={meal}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm leading-none" aria-hidden="true">{meta.emoji}</span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${meta.text}`}>
                {meta.label}
              </span>
              <div className="flex-1 border-t border-gray-100 ml-1" />
              <span className="text-xs text-gray-400 tabular-nums">
                {sectionCals.toLocaleString()} kcal
              </span>
            </div>

            <div className="space-y-2">
              {section.map((entry) => (
                <div
                  key={entry.id}
                  className="relative flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm overflow-hidden"
                >
                  <div className={`absolute left-0 inset-y-0 w-1 ${meta.accent}`} />
                  <div className="flex-1 min-w-0 pl-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{entry.food_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.serving}
                      {" · "}
                      <span className="text-blue-500">P {entry.protein.toFixed(1)}g</span>
                      {" · "}
                      <span className="text-amber-500">C {entry.carbs.toFixed(1)}g</span>
                      {" · "}
                      <span className="text-rose-500">F {entry.fat.toFixed(1)}g</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-sm font-bold text-gray-800 tabular-nums">
                      {entry.calories}{" "}
                      <span className="text-xs font-normal text-gray-400">kcal</span>
                    </span>
                    <button
                      onClick={() => onRemove(entry.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-sm leading-none"
                      aria-label={`Remove ${entry.food_name}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
