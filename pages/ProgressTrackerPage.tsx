
import React, { useState, useEffect } from 'react';
import { UserProfile, ProgressData, NutrientData } from '../types';
import { Icons } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PieChartComponent from '../components/PieChartComponent'; // Assuming pie chart for macro goals

interface ProgressTrackerPageProps {
  activeProfile: UserProfile | undefined;
}

const ProgressTrackerPage: React.FC<ProgressTrackerPageProps> = ({ activeProfile }) => {
  const [progressEntries, setProgressEntries] = useState<ProgressData[]>(() => {
    const saved = localStorage.getItem(`nutrismart-progress-${activeProfile?.id || ''}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [energyLevel, setEnergyLevel] = useState<number | undefined>(3); // Default 1-5 scale
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activeProfile) {
      const saved = localStorage.getItem(`nutrismart-progress-${activeProfile.id}`);
      setProgressEntries(saved ? JSON.parse(saved) : []);
    } else {
      setProgressEntries([]);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem(`nutrismart-progress-${activeProfile.id}`, JSON.stringify(progressEntries));
    }
  }, [progressEntries, activeProfile]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    const newEntry: ProgressData = {
      date,
      weight: weight ? Number(weight) : undefined,
      energyLevel: energyLevel ? Number(energyLevel) : undefined,
      notes,
    };
    // Add or update entry for the date
    setProgressEntries(prev => {
        const existingIndex = prev.findIndex(entry => entry.date === date);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = newEntry;
            return updated.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return [...prev, newEntry].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Clear form for next entry potentially
    // setDate(new Date().toISOString().split('T')[0]); 
    // setWeight(undefined);
    // setEnergyLevel(3);
    // setNotes('');
  };

  if (!activeProfile) {
    return (
      <div className="text-center py-10 bg-white shadow-md rounded-lg">
        <Icons.User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Please select an active profile to track progress.</p>
      </div>
    );
  }
  
  const targetMacroData: NutrientData[] = [];
  if (activeProfile.targetCalories && activeProfile.targetProtein) {
      // Assuming a common 40% Carbs, 30% Protein, 30% Fats distribution for example
      // Protein is given, calculate others based on calories. 1g P/C = 4kcal, 1g F = 9kcal
      const proteinCals = activeProfile.targetProtein * 4;
      const remainingCals = activeProfile.targetCalories - proteinCals;
      const carbCals = remainingCals * 0.55; // 55% of remaining for carbs
      const fatCals = remainingCals * 0.45; // 45% of remaining for fats
      
      targetMacroData.push({ name: 'Protein', value: proteinCals, fill: '#8BC34A' });
      targetMacroData.push({ name: 'Carbs', value: carbCals, fill: '#CDDC39' });
      targetMacroData.push({ name: 'Fats', value: fatCals, fill: '#FF9800' });
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-dark mb-6 flex items-center">
        <Icons.Chart className="w-8 h-8 mr-3 text-primary" /> Progress Tracker for {activeProfile.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Form Section */}
        <form onSubmit={handleAddEntry} className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-primary mb-4">Log New Entry</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input type="number" step="0.1" id="weight" value={weight || ''} onChange={e => setWeight(parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., 70.5"/>
            </div>
            <div>
              <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700">Energy Level (1-5)</label>
              <select id="energyLevel" value={energyLevel || ''} onChange={e => setEnergyLevel(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <option value="">Select</option>
                {[1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>{lvl} ({lvl===1?'Very Low':lvl===3?'Moderate':lvl===5?'Very High':''})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="How are you feeling? Any observations?"></textarea>
            </div>
            <button type="submit" className="w-full bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition flex items-center justify-center">
              <Icons.PlusCircle className="w-5 h-5 mr-2"/> Add / Update Entry
            </button>
          </div>
        </form>

        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-primary mb-4">Progress Overview</h2>
          {progressEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressEntries.filter(entry => entry.weight !== undefined)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-CA')} />
                <YAxis yAxisId="left" dataKey="weight" unit="kg" stroke="#8884d8" />
                <YAxis yAxisId="right" dataKey="energyLevel" orientation="right" domain={[0,5]} stroke="#82ca9d" />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()}/>
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} name="Weight (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="energyLevel" stroke="#82ca9d" name="Energy (1-5)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No progress data yet. Add entries to see your charts.</p>
          )}
          {targetMacroData.length > 0 && (
            <div className="mt-6">
                 <PieChartComponent data={targetMacroData} title="Target Daily Macronutrient Calories" />
            </div>
           )}
        </div>
      </div>
      
      {/* Entries List (optional, can be large) */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-primary mb-4">Logged Entries</h2>
        {progressEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressEntries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.weight ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.energyLevel ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={entry.notes}>{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No entries logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProgressTrackerPage;
