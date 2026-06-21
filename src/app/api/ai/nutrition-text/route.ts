import { NextRequest, NextResponse } from 'next/server';
import { getNutritionFromText } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  let query: string;

  try {
    const body = await request.json();
    query = body?.query;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!query || typeof query !== 'string' || !query.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  try {
    const result = await getNutritionFromText(query.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
