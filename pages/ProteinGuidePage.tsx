
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, ProteinSource } from '../types';
import { getProteinRichFoodSuggestions } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Icons } from '../constants';

interface ProteinGuidePageProps {
  activeProfile: UserProfile | undefined;
}

const ProteinCard: React.FC<{ source: ProteinSource }> = ({ source }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
    <h3 className="text-xl font-semibold text-primary mb-2">{source.name}</h3>
    <p className="text-sm text-gray-700"><span className="font-medium">Type:</span> {source.type}</p>
    <p className="text-sm text-gray-700"><span className="font-medium">Serving Size:</span> {source.servingSize}</p>
    <p className="text-sm text-gray-700"><span className="font-medium">Protein:</span> {source.proteinContent}</p>
    {source.benefits && <p className="text-sm text-gray-600 mt-2 italic"><Icons.Sparkles className="w-4 h-4 inline mr-1 text-secondary"/>{source.benefits}</p>}
  </div>
);

const ProteinGuidePage: React.FC<ProteinGuidePageProps> = ({ activeProfile }) => {
  const [suggestions, setSuggestions] = useState<ProteinSource[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!activeProfile) {
      setSuggestions(null);
      setError("Please select an active profile to get protein suggestions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProteinRichFoodSuggestions(activeProfile);
      setSuggestions(result);
      if (!result || result.length === 0) {
        setError("No specific protein suggestions found for this profile. The AI might be busy or could not find suitable options.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching suggestions.");
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]); // Dependency on fetchSuggestions caused loop, direct activeProfile dependency is fine for re-fetch on profile change

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-dark mb-6 flex items-center">
        <Icons.Protein className="w-8 h-8 mr-3 text-primary" /> Protein-Rich Food Guide
      </h1>

      {!activeProfile && (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <Icons.User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Select an active profile to view personalized protein suggestions.</p>
        </div>
      )}

      {activeProfile && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <p className="text-gray-700">Showing suggestions for: <span className="font-semibold text-primary">{activeProfile.name}</span> ({activeProfile.dietaryPreference})</p>
           <button
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="mt-2 bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-500 transition flex items-center"
            >
            {isLoading ? 'Loading...' : <><Icons.Sparkles className="w-4 h-4 mr-1" /> Refresh Suggestions</>}
          </button>
        </div>
      )}
      
      {isLoading && <LoadingSpinner />}
      {error && !isLoading && <p className="text-red-500 text-center my-4 p-3 bg-red-100 rounded-md">{error}</p>}

      {suggestions && suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((source, index) => (
            <ProteinCard key={index} source={source} />
          ))}
        </div>
      )}
      
      {suggestions === null && !isLoading && !error && activeProfile && (
         <p className="text-center text-gray-500 my-4">Click "Refresh Suggestions" to load protein ideas for the current profile.</p>
      )}

    </div>
  );
};

export default ProteinGuidePage;
