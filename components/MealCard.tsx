
import React from 'react';
import { Meal, MealItem } from '../types';
import { Icons } from '../constants';

interface MealCardProps {
  meal: Meal;
}

const getMealIcon = (mealType: Meal['type']): React.ReactNode => {
  const iconProps = { className: "w-6 h-6 text-primary" };
  switch (mealType) {
    case 'Breakfast':
      return <Icons.Sun {...iconProps} />;
    case 'Lunch':
      return <Icons.Bowl {...iconProps} />;
    case 'Dinner':
      return <Icons.Moon {...iconProps} />;
    case 'Snack':
      return <Icons.Apple {...iconProps} />;
    default:
      return <Icons.Sparkles {...iconProps} />; // Fallback icon
  }
};

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-all hover:shadow-xl">
      <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
        {getMealIcon(meal.type)}
        <span className="ml-2">{meal.type}</span>
      </h3>
      {meal.items.map((item, index) => (
        <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0 last:mb-0">
          <p className="font-medium text-gray-800">{item.name}</p>
          {item.description && <p className="text-sm text-gray-600 italic">{item.description}</p>}
          <div className="flex flex-wrap text-xs text-gray-500 mt-1">
            {item.calories && <span className="mr-3">Calories: {item.calories}</span>}
            {item.protein && <span className="mr-3">Protein: {item.protein}g</span>}
            {item.carbs && <span className="mr-3">Carbs: {item.carbs}g</span>}
            {item.fats && <span className="mr-3">Fats: {item.fats}g</span>}
            {item.fiber && <span>Fiber: {item.fiber}g</span>}
          </div>
          {item.notes && <p className="text-xs text-green-600 mt-1 flex items-center"><Icons.Sparkles className="w-3 h-3 mr-1" /> {item.notes}</p>}
        </div>
      ))}
      {(meal.totalCalories || meal.totalProtein) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            Meal Totals: 
            {meal.totalCalories && ` ~${meal.totalCalories} Calories`}
            {meal.totalProtein && `, ~${meal.totalProtein}g Protein`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MealCard;
