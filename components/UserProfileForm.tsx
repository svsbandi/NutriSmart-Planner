
import React, { useState, useEffect } from 'react';
import { UserProfile, AgeGroup, DietaryPreference, ActivityLevel } from '../types';
import { DefaultUserProfile } from '../constants';

interface UserProfileFormProps {
  profileToEdit?: UserProfile;
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ profileToEdit, onSubmit, onCancel }) => {
  const [profile, setProfile] = useState<UserProfile>(profileToEdit || DefaultUserProfile);

  useEffect(() => {
    if (profileToEdit) {
      setProfile(profileToEdit);
    } else {
      setProfile(DefaultUserProfile);
    }
  }, [profileToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthConditionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Assuming comma-separated string for health conditions
    setProfile(prev => ({ ...prev, healthConditions: value.split(',').map(hc => hc.trim()).filter(hc => hc) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (Years)</label>
          <input type="number" name="age" id="age" value={profile.age || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., 30" />
        </div>
        <div>
          <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700">Age Group</label>
          <select name="ageGroup" id="ageGroup" value={profile.ageGroup} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            {Object.values(AgeGroup).map(group => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
          <select name="dietaryPreference" id="dietaryPreference" value={profile.dietaryPreference} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            {Object.values(DietaryPreference).map(pref => <option key={pref} value={pref}>{pref}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
          <select name="activityLevel" id="activityLevel" value={profile.activityLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
            {Object.values(ActivityLevel).map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="healthConditions" className="block text-sm font-medium text-gray-700">Health Conditions (comma-separated)</label>
        <input type="text" name="healthConditions" id="healthConditions" value={profile.healthConditions.join(', ')} onChange={handleHealthConditionsChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., Diabetes, Hypertension" />
      </div>
      <div>
        <label htmlFor="medications" className="block text-sm font-medium text-gray-700">Medications (optional)</label>
        <textarea name="medications" id="medications" value={profile.medications} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., Metformin 500mg, Aspirin 75mg"></textarea>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="targetCalories" className="block text-sm font-medium text-gray-700">Target Daily Calories (optional)</label>
          <input type="number" name="targetCalories" id="targetCalories" value={profile.targetCalories || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., 2000" />
        </div>
        <div>
          <label htmlFor="targetProtein" className="block text-sm font-medium text-gray-700">Target Daily Protein (g) (optional)</label>
          <input type="number" name="targetProtein" id="targetProtein" value={profile.targetProtein || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., 70" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          {profileToEdit ? 'Save Changes' : 'Add Profile'}
        </button>
      </div>
    </form>
  );
};

export default UserProfileForm;
