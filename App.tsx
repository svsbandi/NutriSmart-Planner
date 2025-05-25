
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { UserProfile, WeeklyPlan, GroceryItem, ChatMessage, ProgressData, GoogleUser } from './types';
import { NavLinks, APP_NAME, Icons, DefaultUserProfile } from './constants';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MealPlannerPage from './pages/MealPlannerPage';
import ProteinGuidePage from './pages/ProteinGuidePage';
import BabyZonePage from './pages/BabyZonePage';
import GroceryListPage from './pages/GroceryListPage';
import AIChatPage from './pages/AIChatPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import SettingsPage from './pages/SettingsPage';
import { v4 as uuidv4 } from 'uuid';
import * as googleAuthService from './services/googleAuthService'; // Renamed import

const App: React.FC = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    const savedProfiles = localStorage.getItem('nutrismart-profiles');
    return savedProfiles ? JSON.parse(savedProfiles) : [
      { ...DefaultUserProfile, id: uuidv4(), name: "Default User" }
    ];
  });
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>(() => {
    const savedPlans = localStorage.getItem('nutrismart-weeklyPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    const savedList = localStorage.getItem('nutrismart-groceryList');
    return savedList ? JSON.parse(savedList) : [];
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = localStorage.getItem('nutrismart-chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // Google Sign-In State
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isGisReady, setIsGisReady] = useState(false);


  useEffect(() => {
    googleAuthService.initClient((gUser, gapiLoaded, gisLoaded) => {
      setGoogleUser(gUser);
      setIsGapiReady(gapiLoaded);
      setIsGisReady(gisLoaded);
    });
  }, []);

  useEffect(() => {
    if (userProfiles.length > 0 && !activeProfileId) {
      setActiveProfileId(userProfiles[0].id);
    }
    localStorage.setItem('nutrismart-profiles', JSON.stringify(userProfiles));
  }, [userProfiles, activeProfileId]);

  useEffect(() => {
    localStorage.setItem('nutrismart-weeklyPlans', JSON.stringify(weeklyPlans));
  }, [weeklyPlans]);

  useEffect(() => {
    localStorage.setItem('nutrismart-groceryList', JSON.stringify(groceryList));
  }, [groceryList]);

  useEffect(() => {
    localStorage.setItem('nutrismart-chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);


  const addProfile = (profile: Omit<UserProfile, 'id'>) => {
    const newProfile = { ...profile, id: uuidv4() };
    setUserProfiles(prev => [...prev, newProfile]);
    if (!activeProfileId) setActiveProfileId(newProfile.id);
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    setUserProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };
  
  const deleteProfile = (profileId: string) => {
    setUserProfiles(prev => {
      const newProfiles = prev.filter(p => p.id !== profileId);
      // Also remove associated progress entries from localStorage
      localStorage.removeItem(`nutrismart-progress-${profileId}`);
      return newProfiles;
    });
    if (activeProfileId === profileId) {
      setActiveProfileId(userProfiles.length > 1 ? userProfiles.find(p => p.id !== profileId)!.id : null);
    }
  };

  const addWeeklyPlan = (plan: WeeklyPlan) => {
    setWeeklyPlans(prev => [...prev.filter(p => p.userId !== plan.userId), plan]); // Replace if exists for user
  };

  const activeProfile = userProfiles.find(p => p.id === activeProfileId);
  const currentPlan = weeklyPlans.find(p => p.userId === activeProfileId);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profiles" element={
              <ProfilePage 
                profiles={userProfiles} 
                activeProfileId={activeProfileId}
                setActiveProfileId={setActiveProfileId}
                onAddProfile={addProfile} 
                onUpdateProfile={updateProfile}
                onDeleteProfile={deleteProfile}
              />} 
            />
            <Route path="/meal-planner" element={
              <MealPlannerPage 
                activeProfile={activeProfile} 
                currentPlan={currentPlan}
                onPlanGenerated={addWeeklyPlan} 
              />} 
            />
            <Route path="/protein-guide" element={<ProteinGuidePage activeProfile={activeProfile} />} />
            <Route path="/baby-zone" element={<BabyZonePage />} />
            <Route path="/grocery-list" element={
              <GroceryListPage 
                groceryList={groceryList} 
                setGroceryList={setGroceryList}
                currentPlan={currentPlan}
              />} 
            />
            <Route path="/ai-coach" element={
              <AIChatPage 
                activeProfile={activeProfile} 
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
              />
            } />
            <Route path="/progress-tracker" element={<ProgressTrackerPage activeProfile={activeProfile} />} />
            <Route path="/settings" element={
              <SettingsPage
                googleUser={googleUser}
                setGoogleUser={setGoogleUser}
                isGapiReady={isGapiReady}
                isGisReady={isGisReady}
              />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white text-2xl font-bold flex items-center">
            <Icons.Sparkles className="h-8 w-8 mr-2 text-accent" />
            {APP_NAME}
          </Link>
          <div className="hidden md:flex space-x-2"> {/* Reduced space for more items */}
            {NavLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.path 
                    ? 'bg-secondary text-white' 
                    : 'text-gray-100 hover:bg-secondary hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-100 hover:text-white focus:outline-none focus:text-white"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NavLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-secondary text-white'
                    : 'text-gray-100 hover:bg-secondary hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-gray-300 py-6 text-center">
      <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      <p className="text-sm">AI-Powered Nutrition for a Healthier You.</p>
    </footer>
  );
};

export default App;
