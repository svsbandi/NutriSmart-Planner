
import React, { useState, useEffect } from 'react';
import { GoogleUser } from '../types';
import { Icons, GOOGLE_CLIENT_ID } from '../constants';
import * as googleAuthService from '../services/googleAuthService'; // Updated import
import LoadingSpinner from '../components/LoadingSpinner';

interface SettingsPageProps {
  googleUser: GoogleUser | null;
  setGoogleUser: (user: GoogleUser | null) => void;
  isGapiReady: boolean;
  isGisReady: boolean;
  // onBackup and onRestore props removed
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  googleUser,
  setGoogleUser: setAppGoogleUser,
  isGapiReady,
  isGisReady,
}) => {
  const [isLoading, setIsLoading] = useState(false); // Kept for potential future async operations
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Logic related to loading backup files removed
  }, [googleUser, isGapiReady]);

  const handleSignIn = () => {
    if (!isGisReady) {
        setMessage("Google Sign-In service is not ready yet. Please wait a moment.");
        return;
    }
    // setIsLoading(true); // Optional: set loading during sign-in process
    googleAuthService.handleSignIn();
    // setIsLoading(false); // Handled by callback in App.tsx
  };

  const handleSignOut = () => {
    googleAuthService.handleSignOut();
    setAppGoogleUser(null); 
    setMessage("Signed out successfully.");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-dark mb-6 flex items-center">
        <Icons.Settings className="w-8 h-8 mr-3 text-primary" /> App Settings
      </h1>

      {message && <p className={`mb-4 p-3 rounded-md ${message.includes('Failed') || message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}
      {isLoading && <LoadingSpinner />}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">Google Account</h2>
        {!isGapiReady || !isGisReady && !googleUser && (
            <p className="text-orange-600 bg-orange-100 p-3 rounded-md">Google services are initializing. Please wait...</p>
        )}
        {googleUser ? (
          <div className="flex items-center space-x-4">
            {googleUser.picture && <img src={googleUser.picture} alt="User" className="w-12 h-12 rounded-full"/>}
            <div>
              <p className="font-semibold">{googleUser.name}</p>
              <p className="text-sm text-gray-600">{googleUser.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center"
            >
              <Icons.Logout className="w-5 h-5 mr-2" /> Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoading || !isGapiReady || !isGisReady}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition flex items-center disabled:opacity-50"
          >
            <Icons.Google className="w-5 h-5 mr-2 fill-current" /> Sign In with Google
          </button>
        )}
      </div>

      {/* Backup and Restore sections removed */}

       {!GOOGLE_CLIENT_ID && (
         <div className="mt-8 p-4 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md">
            <p className="font-semibold flex items-center"><Icons.Alert className="w-5 h-5 mr-2"/>Configuration Incomplete</p>
            <p>Google Client ID is not configured. Google Sign-In features will not work. Please ensure <code>GOOGLE_CLIENT_ID</code> is set in the environment variables or <code>index.html</code>.</p>
        </div>
       )}
    </div>
  );
};

export default SettingsPage;
