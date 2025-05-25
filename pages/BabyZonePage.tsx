
import React, { useState, useCallback } from 'react';
import { BabyFoodSuggestion } from '../types';
import { getBabyFoodSuggestions } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Icons } from '../constants';

const BabyZonePage: React.FC = () => {
  const [ageMonths, setAgeMonths] = useState<number>(6);
  const [suggestions, setSuggestions] = useState<BabyFoodSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (ageMonths < 6 || ageMonths > 24) {
      setError("Please enter an age between 6 and 24 months.");
      setSuggestions(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBabyFoodSuggestions(ageMonths);
      setSuggestions(result);
       if (!result || result.suggestions.length === 0) {
        setError("No specific suggestions found for this age. The AI might be busy or could not find suitable options.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching suggestions.");
    } finally {
      setIsLoading(false);
    }
  }, [ageMonths]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-dark mb-6 flex items-center">
        <Icons.Baby className="w-10 h-10 mr-3 text-primary" /> Baby Nutrition Zone (6-24 Months)
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label htmlFor="ageMonths" className="block text-lg font-medium text-gray-700 mb-2">
          Enter Baby's Age (in months):
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            id="ageMonths"
            value={ageMonths}
            onChange={(e) => setAgeMonths(parseInt(e.target.value))}
            min="6"
            max="24"
            className="mt-1 block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-lg"
          />
          <button
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50 flex items-center text-lg"
          >
            {isLoading ? <LoadingSpinner size="sm"/> : <><Icons.Sparkles className="w-5 h-5 mr-2" /> Get Suggestions</>}
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && !isLoading && <p className="text-red-500 text-center my-4 p-3 bg-red-100 rounded-md">{error}</p>}

      {suggestions && !isLoading && !error && (
        <div className="bg-white shadow-xl rounded-lg p-6 mt-8 animate-fadeIn">
          <h2 className="text-2xl font-semibold text-primary mb-2">Suggestions for {suggestions.ageRange}</h2>
          <p className="text-md text-gray-700 mb-1"><span className="font-medium">Recommended Food Type:</span> {suggestions.foodType}</p>
          
          <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Food Ideas:</h3>
          {suggestions.suggestions.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 pl-4">
              {suggestions.suggestions.map((item, index) => (
                <li key={index} className="text-md">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No specific food items suggested by AI for this query.</p>
          )}

          {suggestions.tips && (
            <>
              <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Important Tips:</h3>
              <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-4 rounded-md border border-yellow-200">{suggestions.tips}</p>
            </>
          )}
          <p className="mt-8 text-sm text-gray-500 italic">
            Disclaimer: These are general suggestions. Always consult your pediatrician for personalized advice regarding your baby's nutrition and health. Introduce new foods one at a time and watch for any allergic reactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default BabyZonePage;
