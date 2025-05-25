
import React, { useState, useEffect, useCallback } from 'react';
import { GroceryItem, WeeklyPlan, MealItem } from '../types';
import { Icons } from '../constants';

interface GroceryListPageProps {
  groceryList: GroceryItem[];
  setGroceryList: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  currentPlan: WeeklyPlan | undefined;
}

// Helper to extract ingredients from meal items
const extractIngredientsFromPlan = (plan: WeeklyPlan): GroceryItem[] => {
  const ingredientsMap = new Map<string, { count: number; unit?: string }>();

  plan.days.forEach(day => {
    day.meals.forEach(meal => {
      meal.items.forEach(item => {
        // Basic extraction: assumes item name is the ingredient.
        // More sophisticated NLP could be used here or structured data from AI.
        // For now, just use the item name. Quantity will be generic.
        const itemName = item.name.toLowerCase().trim();
        // Try to extract quantity/unit if present in description, e.g. "200g Paneer" or "Paneer (200g)"
        // This is a very naive parser. A robust solution needs better AI output or manual input.
        let quantity = "1 unit"; // Default quantity
        
        // Attempt to find common patterns like " (100g)" or " - 2 cups"
        const quantityMatch = item.name.match(/\(?\s*(\d+\s*\w+)\s*\)?$/) || item.description?.match(/(\d+\s*\w+)/);
        if (quantityMatch && quantityMatch[1]) {
            quantity = quantityMatch[1];
        }

        const existing = ingredientsMap.get(itemName);
        if (existing) {
          ingredientsMap.set(itemName, { count: existing.count + 1, unit: existing.unit || quantity });
        } else {
          ingredientsMap.set(itemName, { count: 1, unit: quantity });
        }
      });
    });
  });

  return Array.from(ingredientsMap.entries()).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
    quantity: data.count > 1 && data.unit === "1 unit" ? `${data.count} units` : data.unit || "As needed",
    category: 'Uncategorized', // Could be improved with AI categorization
    checked: false,
  }));
};


const GroceryListPage: React.FC<GroceryListPageProps> = ({ groceryList, setGroceryList, currentPlan }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const generateListFromPlan = useCallback(() => {
    if (currentPlan) {
      const extractedItems = extractIngredientsFromPlan(currentPlan);
      // Merge with existing or replace? For now, let's replace.
      // A better approach might be to add new items and update quantities.
      if (extractedItems.length > 0) {
        setGroceryList(extractedItems);
         alert(`${extractedItems.length} items generated from your current meal plan!`);
      } else {
        alert("No ingredients could be automatically extracted from the current meal plan, or the plan is empty.");
      }
    } else {
      alert("No active meal plan found to generate a grocery list from.");
    }
  }, [currentPlan, setGroceryList]);

  const addItemManually = () => {
    if (newItemName.trim() === '') return;
    const newItem: GroceryItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || '1 unit',
      category: 'Manual',
      checked: false,
    };
    setGroceryList(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQuantity('');
  };

  const toggleItemChecked = (index: number) => {
    setGroceryList(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setGroceryList(prev => prev.filter((_, i) => i !== index));
  };

  const clearList = () => {
    if (window.confirm("Are you sure you want to clear the entire grocery list?")) {
        setGroceryList([]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark mb-4 md:mb-0 flex items-center">
          <Icons.Grocery className="w-8 h-8 mr-3 text-primary" /> Grocery List
        </h1>
        <div className="flex space-x-2">
           <button
            onClick={generateListFromPlan}
            disabled={!currentPlan}
            className="bg-secondary text-white px-4 py-2 rounded-lg shadow hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            title={!currentPlan ? "No active meal plan to generate from" : "Generate list from current meal plan"}
          >
            <Icons.Sparkles className="w-5 h-5 mr-2" /> Generate from Plan
          </button>
           <button
            onClick={clearList}
            disabled={groceryList.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Icons.Trash className="w-5 h-5 mr-2" /> Clear List
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-primary mb-3">Add Item Manually</h2>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <input 
            type="text" 
            value={newItemName} 
            onChange={(e) => setNewItemName(e.target.value)} 
            placeholder="Item name (e.g., Apples)"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          <input 
            type="text" 
            value={newItemQuantity} 
            onChange={(e) => setNewItemQuantity(e.target.value)} 
            placeholder="Quantity (e.g., 1kg, 2 packs)"
            className="md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
          <button onClick={addItemManually} className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition flex items-center justify-center">
            <Icons.PlusCircle className="w-5 h-5 mr-2"/> Add Item
          </button>
        </div>
      </div>

      {groceryList.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
           <Icons.Grocery className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
          <p className="text-gray-600 text-lg">Your grocery list is empty.</p>
          <p className="text-gray-500 text-sm">Add items manually or generate them from your meal plan.</p>
        </div>
      ) : (
        <ul className="bg-white shadow-xl rounded-lg p-4 divide-y divide-gray-200">
          {groceryList.map((item, index) => (
            <li key={index} className={`py-4 flex items-center justify-between ${item.checked ? 'opacity-60' : ''}`}>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => toggleItemChecked(index)}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary mr-4 cursor-pointer"
                />
                <div>
                  <span className={`text-lg font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {item.name}
                  </span>
                  <span className={`block text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {item.quantity} {item.category && `(${item.category})`}
                  </span>
                </div>
              </div>
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Icons.Trash className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroceryListPage;
