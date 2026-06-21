const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export interface NutritionResult {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    food_name: { type: 'STRING' },
    calories: { type: 'NUMBER' },
    protein: { type: 'NUMBER' },
    carbs: { type: 'NUMBER' },
    fat: { type: 'NUMBER' },
    serving: { type: 'STRING' },
  },
  required: ['food_name', 'calories', 'protein', 'carbs', 'fat', 'serving'],
};

function buildRequestBody(parts: unknown[]) {
  return {
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  };
}

async function callGemini(body: object): Promise<NutritionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content');

  return JSON.parse(text) as NutritionResult;
}

export async function getNutritionFromText(query: string): Promise<NutritionResult> {
  const prompt = `You are a nutrition expert. The user described a meal or food: "${query}".
Return the total estimated nutrition for one typical serving of what was described.
Be specific with the food_name (e.g. "Grilled Chicken Breast with White Rice" not just "meal").
Round calories to the nearest integer. Round protein, carbs, and fat to one decimal place.
Use grams (g) for serving size where possible.`;

  return callGemini(buildRequestBody([{ text: prompt }]));
}

export async function getNutritionFromImage(
  imageBase64: string,
  mimeType: string
): Promise<NutritionResult> {
  const prompt = `You are a nutrition expert analyzing a photo of food.
Identify all visible foods and estimate the total nutrition for the entire portion shown.
Be specific with food_name (e.g. "Grilled Salmon with Roasted Vegetables" not just "meal").
Round calories to the nearest integer. Round protein, carbs, and fat to one decimal place.
Use grams (g) for serving size where possible.`;

  return callGemini(
    buildRequestBody([
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } },
    ])
  );
}
