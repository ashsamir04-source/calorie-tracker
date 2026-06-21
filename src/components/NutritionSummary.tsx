"use client";

import { DailyTotals } from "@/types";

const CALORIE_GOAL = 2000;

interface Props {
  totals: DailyTotals;
}

export default function NutritionSummary({ totals }: Props) {
  const pct = Math.min(100, Math.round((totals.calories / CALORIE_GOAL) * 100));
  const remaining = CALORIE_GOAL - totals.calories;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-4xl font-bold text-gray-900">{totals.calories}</span>
          <span className="text-gray-400 text-sm ml-1">/ {CALORIE_GOAL} kcal</span>
        </div>
        <span className={`text-sm font-medium ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${pct >= 100 ? "bg-red-400" : "bg-emerald-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MacroCard label="Protein" value={totals.protein} unit="g" color="text-blue-600" />
        <MacroCard label="Carbs" value={totals.carbs} unit="g" color="text-amber-500" />
        <MacroCard label="Fat" value={totals.fat} unit="g" color="text-rose-500" />
      </div>
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className={`text-xl font-semibold ${color}`}>{value.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span></p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
