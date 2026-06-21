"use client";

import { useEffect, useState } from "react";
import { DailyTotals } from "@/types";

const CALORIE_GOAL = 2000;
const MACRO_GOALS = { protein: 150, carbs: 250, fat: 65 };
const ARC_R = 76;
const ARC_LEN = Math.PI * ARC_R;

function progressColor(pct: number) {
  if (pct >= 95) return "#EF4444";
  if (pct >= 75) return "#F59E0B";
  return "#22C55E";
}

interface Props {
  totals: DailyTotals;
}

export default function NutritionSummary({ totals }: Props) {
  const pct = Math.min(100, Math.round((totals.calories / CALORIE_GOAL) * 100));
  const remaining = CALORIE_GOAL - totals.calories;
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  const offset = ARC_LEN * (1 - animPct / 100);
  const color = progressColor(pct);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Calorie arc */}
      <div className="relative flex flex-col items-center mb-6">
        <svg viewBox="0 0 200 106" fill="none" className="w-52" aria-hidden="true">
          <path
            d="M 24 96 A 76 76 0 0 1 176 96"
            stroke="#F3F4F6"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 24 96 A 76 76 0 0 1 176 96"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LEN} ${ARC_LEN}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.65s ease, stroke 0.3s ease" }}
          />
        </svg>

        <div className="absolute bottom-0 text-center pb-1">
          <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
            {totals.calories.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">of {CALORIE_GOAL.toLocaleString()} kcal</p>
          <p
            className="text-xs font-semibold mt-1"
            style={{ color: remaining >= 0 ? "#16A34A" : "#EF4444" }}
          >
            {remaining >= 0
              ? `${remaining.toLocaleString()} remaining`
              : `${Math.abs(remaining).toLocaleString()} over goal`}
          </p>
        </div>
      </div>

      {/* Macro bars */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <MacroBar label="Protein" value={totals.protein} goal={MACRO_GOALS.protein} color="#3B82F6" />
        <MacroBar label="Carbs" value={totals.carbs} goal={MACRO_GOALS.carbs} color="#F59E0B" />
        <MacroBar label="Fat" value={totals.fat} goal={MACRO_GOALS.fat} color="#F43F5E" />
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs text-gray-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 tabular-nums w-20 text-right shrink-0">
        {value.toFixed(0)}g{" "}
        <span className="font-normal text-gray-400">/ {goal}g</span>
      </span>
    </div>
  );
}
