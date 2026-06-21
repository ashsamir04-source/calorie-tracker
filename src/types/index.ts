export type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export interface LogEntry {
  id: number;
  date: string;
  meal?: MealCategory;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  created_at: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
