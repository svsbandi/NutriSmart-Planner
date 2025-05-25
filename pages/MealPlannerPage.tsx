
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, WeeklyPlan, DailyPlan, MealPlanMode } from '../types';
import { generateWeeklyMealPlan } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import MealCard from '../components/MealCard';
import { Icons } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import PieChartComponent from '../components/PieChartComponent';

interface MealPlannerPageProps {
  activeProfile: UserProfile | undefined;
  currentPlan: WeeklyPlan | undefined;
  onPlanGenerated: (plan: WeeklyPlan) => void;
}

const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ activeProfile, currentPlan, onPlanGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyPlan['day'] | null>(null);
  const [planMode, setPlanMode] = useState<MealPlanMode>(MealPlanMode.BALANCED);

  const [displayPlan, setDisplayPlan] = useState<WeeklyPlan | undefined>(currentPlan);

  useEffect(() => {
    setDisplayPlan(currentPlan);
    if (currentPlan && currentPlan.days.length > 0) {
      setSelectedDay(currentPlan.days[0].day);
    } else {
      setSelectedDay(null);
    }
  }, [currentPlan]);
  
  const handleGeneratePlan = useCallback(async () => {
    if (!activeProfile) {
      setError("Please select an active profile first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateWeeklyMealPlan(activeProfile, planMode);
      if (plan) {
        const completePlan = {
            ...plan,
            userId: activeProfile.id,
            planId: plan.planId || uuidv4(),
            startDate: plan.startDate || new Date().toISOString().split('T')[0],
        };
        onPlanGenerated(completePlan);
        setDisplayPlan(completePlan);
        if (completePlan.days.length > 0) {
            setSelectedDay(completePlan.days[0].day);
        }
      } else {
        setError("Failed to generate meal plan. The AI might be busy or unable to process the request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while generating the plan.");
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile, onPlanGenerated, planMode]);

  if (!activeProfile) {
    return (
      <div className="text-center py-10 bg-white shadow-md rounded-lg">
        <Icons.User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Please select or create a user profile to generate a meal plan.</p>
      </div>
    );
  }
  
  const dailyPlanToDisplay = displayPlan?.days.find(d => d.day === selectedDay);

  const getNutrientDataForDay = (dailyPlan?: DailyPlan) => {
    if (!dailyPlan) return [];
    let totalProtein = 0, totalCarbs = 0, totalFats = 0;
    dailyPlan.meals.forEach(meal => {
        meal.items.forEach(item => {
            totalProtein += item.protein || 0;
            totalCarbs += item.carbs || 0;
            totalFats += item.fats || 0;
        });
    });
    const totalMacros = totalProtein + totalCarbs + totalFats;
    if (totalMacros === 0) return []; // Avoid division by zero if no macro data
    
    return [
        { name: 'Protein', value: totalProtein, fill: '#8BC34A' }, // secondary color
        { name: 'Carbs', value: totalCarbs, fill: '#CDDC39' },   // accent color
        { name: 'Fats', value: totalFats, fill: '#FF9800' },     // an orange color
    ];
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-dark mb-6">Weekly Meal Planner</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-primary mb-2">Current Profile: {activeProfile.name}</h2>
        <p className="text-sm text-gray-600 mb-1">Diet: {activeProfile.dietaryPreference} | Activity: {activeProfile.activityLevel}</p>
        {activeProfile.healthConditions.length > 0 && <p className="text-sm text-gray-600 mb-1">Health Conditions: {activeProfile.healthConditions.join(', ')}</p>}
        
        <div className="my-4">
            <label htmlFor="planMode" className="block text-sm font-medium text-gray-700 mb-1">Select Meal Plan Mode:</label>
            <select 
                id="planMode" 
                name="planMode"
                value={planMode}
                onChange={(e) => setPlanMode(e.target.value as MealPlanMode)}
                className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
                {Object.values(MealPlanMode).map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                ))}
            </select>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center w-full md:w-auto"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <><Icons.Sparkles className="w-5 h-5 mr-2" /> {displayPlan ? 'Regenerate Plan' : 'Generate Meal Plan'}</>}
        </button>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>

      {isLoading && !displayPlan && <LoadingSpinner size="lg" />}

      {displayPlan && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-dark mb-4">Your 7-Day Meal Plan</h2>
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
            {displayPlan.days.map(day => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedDay === day.day 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day.day}
              </button>
            ))}
            </div>
          </div>

          {dailyPlanToDisplay && (
            <div className="bg-white p-6 rounded-lg shadow-xl animate-fadeIn">
              <h3 className="text-xl font-bold text-primary mb-1">{dailyPlanToDisplay.day}'s Meals</h3>
              {dailyPlanToDisplay.dailyTotalCalories && dailyPlanToDisplay.dailyTotalProtein && (
                  <p className="text-sm text-gray-600 mb-4">
                    Est. Daily Totals: ~{dailyPlanToDisplay.dailyTotalCalories} Calories, ~{dailyPlanToDisplay.dailyTotalProtein}g Protein
                  </p>
              )}
              {dailyPlanToDisplay.notes && <p className="text-sm text-green-700 bg-green-100 p-2 rounded-md mb-4 italic"><Icons.Sparkles className="w-4 h-4 inline mr-1"/>Note: {dailyPlanToDisplay.notes}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dailyPlanToDisplay.meals.map((meal, index) => (
                  <MealCard key={`${dailyPlanToDisplay!.day}-${meal.type}-${index}`} meal={meal} />
                ))}
              </div>
              
              <PieChartComponent 
                data={getNutrientDataForDay(dailyPlanToDisplay)}
                title={`${dailyPlanToDisplay.day} - Macronutrient Distribution (Estimated)`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlannerPage;

