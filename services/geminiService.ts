
import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import { UserProfile, WeeklyPlan, DailyPlan, Meal, MealItem, ProteinSource, BabyFoodSuggestion, MealPlanMode, ChatMessage, GroundingSource } from '../types';

// --- API Key Configuration ---
// Attempt to get from window.APP_CONFIG first (for local dev, set in index.html),
// then process.env (for hypothetical build env or if set globally).
// @ts-ignore
const getConfigValue = (keyName) => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.APP_CONFIG && typeof window.APP_CONFIG[keyName] !== 'undefined') {
    // @ts-ignore
    return window.APP_CONFIG[keyName] === `YOUR_${keyName}_HERE` ? null : window.APP_CONFIG[keyName];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && typeof process.env[keyName] !== 'undefined') {
    // @ts-ignore
    return process.env[keyName];
  }
  return null; // Default to null if not found or is placeholder
};

const API_KEY = getConfigValue('API_KEY');
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error(
    "Gemini API_KEY is not configured. AI features will not work. " +
    "Please ensure API_KEY is set in the APP_CONFIG in index.html (for local development) " +
    "or as an environment variable."
  );
}

const MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

const parseJsonFromGeminiResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Raw response:", text);
    return null;
  }
};


export const generateWeeklyMealPlan = async (profile: UserProfile, mode: MealPlanMode = MealPlanMode.BALANCED): Promise<WeeklyPlan | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API_KEY might be missing.");
    return null;
  }
  
  const prompt = `
    You are an expert nutritionist. Generate a 7-day detailed meal plan for the following user profile:
    - Age: ${profile.age || profile.ageGroup}
    - Dietary Preference: ${profile.dietaryPreference}
    - Activity Level: ${profile.activityLevel}
    - Health Conditions: ${profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : 'None specified'}
    - Medications: ${profile.medications || 'None specified'}
    - Target Daily Calories: ${profile.targetCalories ? profile.targetCalories + ' kcal' : 'auto-calculate based on profile'}
    - Target Daily Protein: ${profile.targetProtein ? profile.targetProtein + 'g' : 'auto-calculate based on profile'}
    - Meal Plan Mode: ${mode} (Options: ${Object.values(MealPlanMode).join(', ')})

    Instructions:
    1.  Provide a plan for 7 days (Monday to Sunday).
    2.  For each day, include Breakfast, Lunch, Dinner, and one optional Snack.
    3.  For each meal item, provide: name, estimated calories, protein (g), carbs (g), fats (g), fiber (g). Include a brief description if helpful.
    4.  Include Indian and Global meal options.
    5.  If medications are listed, be mindful of common food-drug interactions (e.g., grapefruit with statins). Add a note if a meal is specifically designed to avoid an interaction.
    6.  Provide estimated total daily calories and protein for each day.
    7.  Return the response as a JSON object matching this TypeScript interface:
        \`\`\`typescript
        interface MealItem { name: string; description?: string; calories?: number; protein?: number; carbs?: number; fats?: number; fiber?: number; notes?: string; }
        interface Meal { type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'; items: MealItem[]; totalCalories?: number; totalProtein?: number;}
        interface DailyPlan { day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'; meals: Meal[]; dailyTotalCalories?: number; dailyTotalProtein?: number; notes?: string; }
        interface WeeklyPlan { userId: string; planId: string; startDate: string; days: DailyPlan[]; summary?: { totalCaloriesAvg: number; totalProteinAvg: number; micronutrientFocus?: string[]; }; }
        \`\`\`
    8.  For the 'planId', generate a UUID. For 'userId', use "${profile.id}". For 'startDate', use today's date in YYYY-MM-DD format.
    9.  For meal item notes, you can add things like "Iron-rich", "Good source of Vitamin C", etc.
    10. For daily notes, add advice like "Focus on hydration" or specific nutrient focus for that day.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const planData = parseJsonFromGeminiResponse<WeeklyPlan>(response.text);
    if (planData) {
      // Ensure all days are present, even if AI misses one
      const daysOfWeek: DailyPlan['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const completeDays = daysOfWeek.map(dayName => {
        const foundDay = planData.days.find(d => d.day === dayName);
        if (foundDay) return foundDay;
        return { day: dayName, meals: [], dailyTotalCalories: 0, dailyTotalProtein: 0, notes: "Rest day or adjust as needed." };
      });
      return { ...planData, days: completeDays };
    }
    return null;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return null;
  }
};


export const getProteinRichFoodSuggestions = async (profile: UserProfile): Promise<ProteinSource[] | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API_KEY might be missing.");
    return null;
  }

  const prompt = `
    Suggest 5-7 protein-rich food sources suitable for a user with the following profile:
    - Age Group: ${profile.ageGroup}
    - Dietary Preference: ${profile.dietaryPreference}

    For each food source, provide:
    - name: Name of the food (e.g., "Lentils", "Chicken Breast", "Tofu")
    - type: "Vegetarian", "Non-Vegetarian", or "Vegan" (must match user's preference or be suitable)
    - servingSize: Typical serving size (e.g., "1 cup cooked", "100g")
    - proteinContent: Protein in grams for that serving size (e.g., "18g")
    - benefits: Optional brief benefits or notes (e.g., "Rich in fiber", "Lean protein source")

    Return the response as a JSON array of objects matching this TypeScript interface:
    \`\`\`typescript
    interface ProteinSource {
      name: string;
      type: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
      servingSize: string;
      proteinContent: string;
      benefits?: string;
    }
    \`\`\`
    Prioritize sources commonly available and relevant to the user's dietary preference.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<ProteinSource[]>(response.text);
  } catch (error) {
    console.error("Error getting protein suggestions:", error);
    return null;
  }
};

export const getBabyFoodSuggestions = async (ageMonths: number): Promise<BabyFoodSuggestion | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API_KEY might be missing.");
    return null;
  }

  let ageRange = "";
  let foodType: BabyFoodSuggestion['foodType'] = 'Pureed';

  if (ageMonths >= 6 && ageMonths <= 8) {
    ageRange = "6-8 months";
    foodType = 'Pureed';
  } else if (ageMonths > 8 && ageMonths <= 10) {
    ageRange = "8-10 months";
    foodType = 'Mashed';
  } else if (ageMonths > 10 && ageMonths <= 12) {
    ageRange = "10-12 months";
    foodType = 'Finger Food';
  } else if (ageMonths > 12 && ageMonths <= 24) {
    ageRange = "12-24 months";
    foodType = 'Finger Food'; // Or varied family foods
  } else {
    return { ageRange: "N/A", foodType: 'Pureed', suggestions: ["Age out of typical range for specific suggestions via this tool. Consult pediatrician."], tips: "Consult pediatrician for specific advice." };
  }

  const prompt = `
    Provide baby food suggestions for a baby aged ${ageRange}.
    Focus on ${foodType}.
    Include tips for weaning, introducing new foods, and allergy awareness for this age.
    Pediatrician-approved type suggestions.

    Return the response as a JSON object matching this TypeScript interface:
    \`\`\`typescript
    interface BabyFoodSuggestion {
      ageRange: string; // e.g., "6-8 months"
      foodType: 'Pureed' | 'Mashed' | 'Finger Food';
      suggestions: string[]; // List of food items or simple meal ideas
      tips?: string; // General tips for this stage
    }
    \`\`\`
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<BabyFoodSuggestion>(response.text);
  } catch (error) {
    console.error("Error getting baby food suggestions:", error);
    return null;
  }
};


let chatInstance: Chat | null = null;

export const getAIChatResponse = async (message: string, profile?: UserProfile, history?: ChatMessage[]): Promise<{text: string, sources?: GroundingSource[]}> => {
  if (!ai) {
     return { text: "AI service is currently unavailable. API Key not configured or AI client failed to initialize." };
  }

  const systemInstructionParts: Part[] = [{text: `You are NutriSmart Planner's AI Diet Coach. 
    Provide helpful, accurate, and safe advice on nutrition, diet, healthy eating habits. 
    If asked about food-medication interactions, provide general information (e.g., grapefruit and statins) but always emphasize consulting a doctor or pharmacist for personal medical advice. 
    If the user provides their profile, tailor advice accordingly. User profile: ${profile ? JSON.stringify(profile) : 'Not provided'}.
    Always advise consulting a doctor or registered dietitian for personalized medical or dietary advice before making significant changes.
    If you use external information to answer a question about recent events, news, or specific up-to-date facts, cite your sources.`
  }];
  
  const chatHistory = history?.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{text: msg.text}]
  })) || [];


  if (!chatInstance) {
     chatInstance = ai.chats.create({
        model: MODEL_TEXT,
        history: chatHistory,
        config: {
          systemInstruction: { role: "system", parts: systemInstructionParts },
          tools: [{googleSearch: {}}], // Enable Google Search for grounding
        },
     });
  }
  
  try {
    const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    let sources: GroundingSource[] | undefined = undefined;
    if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
        sources = groundingMetadata.groundingChunks
            .map(chunk => chunk.web)
            .filter(web => web !== undefined) as GroundingSource[];
    }
    return { text: response.text, sources };

  } catch (error) {
    console.error("Error getting AI chat response:", error);
    // Reset chatInstance on error to allow re-initialization
    chatInstance = null; 
    return { text: "Sorry, I encountered an error trying to respond. Please try again." };
  }
};

export const suggestMealFromIngredients = async (ingredients: string[], profile?: UserProfile): Promise<string | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. API_KEY might be missing.");
    return "AI service is unavailable. Please check API key configuration.";
  }
  if (ingredients.length === 0) return "Please provide some ingredients.";

  const prompt = `
    You are a creative chef. Suggest 2-3 healthy meal ideas using ONLY the following ingredients: ${ingredients.join(', ')}.
    Consider the user's profile if available: ${profile ? `Age: ${profile.ageGroup}, Dietary Preference: ${profile.dietaryPreference}, Health Conditions: ${profile.healthConditions.join(', ')}` : 'No profile provided.'}
    Provide a brief description for each meal idea. Keep it concise.
    Example output format:
    "1. Meal Idea One: Brief description.
     2. Meal Idea Two: Brief description."
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error suggesting meal from ingredients:", error);
    return "Sorry, I couldn't come up with suggestions right now.";
  }
};