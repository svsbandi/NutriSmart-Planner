
export enum AgeGroup {
  INFANT = 'Infant (0-1 years)',
  CHILD = 'Child (1-12 years)',
  TEEN = 'Teen (13-19 years)',
  ADULT = 'Adult (20-59 years)',
  SENIOR = 'Senior (60+ years)',
}

export enum DietaryPreference {
  VEGETARIAN = 'Vegetarian',
  NON_VEGETARIAN = 'Non-Vegetarian',
  VEGAN = 'Vegan',
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary (little or no exercise)',
  LIGHT = 'Light (light exercise/sports 1-3 days/week)',
  MODERATE = 'Moderate (moderate exercise/sports 3-5 days/week)',
  ACTIVE = 'Active (hard exercise/sports 6-7 days a week)',
  VERY_ACTIVE = 'Very Active (very hard exercise/sports & physical job)',
}

export enum MealPlanMode {
  BALANCED = 'Balanced',
  WEIGHT_LOSS = 'Weight Loss',
  FESTIVE = 'Festive',
  LIGHT = 'Light Meals',
}

export interface UserProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  age?: number; // Specific age for more precise calculations
  dietaryPreference: DietaryPreference;
  healthConditions: string[];
  medications: string;
  activityLevel: ActivityLevel;
  targetCalories?: number;
  targetProtein?: number;
}

export interface MealItem {
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  notes?: string; // e.g., "Iron-rich", "Good source of Vitamin C"
}

export interface Meal {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  items: MealItem[];
  totalCalories?: number;
  totalProtein?: number;
}

export interface DailyPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  meals: Meal[];
  dailyTotalCalories?: number;
  dailyTotalProtein?: number;
  notes?: string; // e.g., "Focus on hydration", "Include Omega-3 source"
}

export interface WeeklyPlan {
  userId: string;
  planId: string;
  startDate: string; // ISO Date string
  days: DailyPlan[];
  summary?: {
    totalCaloriesAvg: number;
    totalProteinAvg: number;
    micronutrientFocus?: string[];
  };
}

export interface GroceryItem {
  name: string;
  quantity: string;
  category?: string;
  checked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ProteinSource {
  name: string;
  type: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
  servingSize: string;
  proteinContent: string;
  benefits?: string;
}

export interface BabyFoodSuggestion {
  ageRange: string; // e.g., "6-8 months"
  foodType: 'Pureed' | 'Mashed' | 'Finger Food';
  suggestions: string[];
  tips?: string;
}

export interface ProgressData {
  date: string;
  weight?: number;
  energyLevel?: number; // 1-5
  notes?: string;
}

export interface NutrientData {
  name: string;
  value: number;
  fill: string;
}

// For Google Sign-In
export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}
