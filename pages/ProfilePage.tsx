
import React, { useState } from 'react';
import { UserProfile } from '../types';
import UserProfileForm from '../components/UserProfileForm';
import Modal from '../components/Modal';
import { Icons } from '../constants';

interface ProfilePageProps {
  profiles: UserProfile[];
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;
  onAddProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profiles, activeProfileId, setActiveProfileId, onAddProfile, onUpdateProfile, onDeleteProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<UserProfile | undefined>(undefined);

  const handleAddNewProfile = () => {
    setProfileToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: UserProfile) => {
    setProfileToEdit(profile);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (profileData: UserProfile) => {
    if (profileToEdit) {
      onUpdateProfile(profileData);
    } else {
      onAddProfile(profileData);
    }
    setIsModalOpen(false);
    setProfileToEdit(undefined);
  };
  
  const handleDeleteClick = (profileId: string, profileName: string) => {
    if (window.confirm(`Are you sure you want to delete profile "${profileName}"? This action cannot be undone.`)) {
      onDeleteProfile(profileId);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark">User Profiles</h1>
        <button
          onClick={handleAddNewProfile}
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 transition flex items-center"
        >
          <Icons.PlusCircle className="w-5 h-5 mr-2" /> Add New Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <Icons.User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No profiles found. Start by adding a new profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className={`p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300
                          ${profile.id === activeProfileId ? 'bg-secondary ring-4 ring-accent' : 'bg-white hover:shadow-xl'}`}
              onClick={() => setActiveProfileId(profile.id)}
            >
              <div className="flex justify-between items-start">
                <h2 className={`text-2xl font-semibold mb-2 ${profile.id === activeProfileId ? 'text-white' : 'text-primary'}`}>{profile.name}</h2>
                {profile.id === activeProfileId && (
                    <span className="text-xs bg-accent text-dark font-semibold px-2 py-1 rounded-full">ACTIVE</span>
                )}
              </div>
              <p className={`text-sm mb-1 ${profile.id === activeProfileId ? 'text-gray-100' : 'text-gray-700'}`}>Age Group: {profile.ageGroup}</p>
              <p className={`text-sm mb-1 ${profile.id === activeProfileId ? 'text-gray-100' : 'text-gray-700'}`}>Diet: {profile.dietaryPreference}</p>
              <p className={`text-sm mb-3 ${profile.id === activeProfileId ? 'text-gray-100' : 'text-gray-700'}`}>Activity: {profile.activityLevel}</p>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditProfile(profile);}}
                  className={`px-4 py-2 text-sm rounded-md ${profile.id === activeProfileId ? 'bg-white text-secondary hover:bg-gray-200' : 'bg-primary text-white hover:bg-green-600'}`}
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(profile.id, profile.name);}}
                  className={`px-4 py-2 text-sm rounded-md ${profile.id === activeProfileId ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={profileToEdit ? 'Edit Profile' : 'Add New Profile'}>
        <UserProfileForm
          profileToEdit={profileToEdit}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;
