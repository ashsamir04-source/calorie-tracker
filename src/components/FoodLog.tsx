"use client";

import { LogEntry } from "@/types";

interface Props {
  entries: LogEntry[];
  onRemove: (id: number) => void;
}

export default function FoodLog({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Nothing logged yet</p>
        <p className="text-sm mt-1">Click any food above to add it</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-gray-800 truncate">{entry.food_name}</span>
              <span className="text-xs text-gray-400 shrink-0">{entry.serving}</span>
            </div>
            <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
              <span className="text-blue-500 font-medium">{entry.protein.toFixed(1)}g P</span>
              <span className="text-amber-500 font-medium">{entry.carbs.toFixed(1)}g C</span>
              <span className="text-rose-500 font-medium">{entry.fat.toFixed(1)}g F</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-3 shrink-0">
            <span className="text-sm font-semibold text-gray-700">{entry.calories} kcal</span>
            <button
              onClick={() => onRemove(entry.id)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-base leading-none"
              title="Remove"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
