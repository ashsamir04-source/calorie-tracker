import { NextRequest, NextResponse } from "next/server";
import { getEntriesByDate, addEntry } from "@/lib/db";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  return NextResponse.json(getEntriesByDate(date));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, meal, food_name, calories, protein, carbs, fat, serving } = body;
  if (!date || !food_name) {
    return NextResponse.json({ error: "date and food_name required" }, { status: 400 });
  }
  const entry = addEntry({ date, meal, food_name, calories, protein, carbs, fat, serving });
  return NextResponse.json(entry, { status: 201 });
}
