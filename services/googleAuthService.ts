
import { GOOGLE_CLIENT_ID, DRIVE_SCOPES } from '../constants';
import { GoogleUser } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
    handleGoogleApiScriptLoad?: { // For script onload in index.html if that approach is used
        onGapiLoad: () => void;
        onGisLoad: () => void;
    }
  }
}

let gapiInited = false;
let gisInited = false;
let currentGoogleUser: GoogleUser | null = null;
let updateAuthStatusCallback: ((user: GoogleUser | null, gapiLoaded: boolean, gisLoaded: boolean) => void) | null = null;

export const initClient = (callback: (user: GoogleUser | null, gapiLoaded: boolean, gisLoaded: boolean) => void) => {
  updateAuthStatusCallback = callback;

  // Load GAPI client
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.async = true;
  gapiScript.defer = true;
  gapiScript.onload = () => {
    window.gapi.load('client', initializeGapiClient);
  };
  document.body.appendChild(gapiScript);

  // Load GIS client
  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = initializeGisClient;
  document.body.appendChild(gisScript);
};

const initializeGapiClient = async () => {
  try {
    // Minimal initialization, primarily for gapi.client.setToken/getToken to work if needed.
    // No API key or discoveryDocs needed for just Sign-In userinfo.
    await window.gapi.client.init({}); // Empty init as no specific client services are pre-loaded here.
    gapiInited = true;
    if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, gisInited);
  } catch (error) {
    console.error("Error initializing GAPI client:", error);
    if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, false, gisInited);
  }
};

const initializeGisClient = () => {
  if (!GOOGLE_CLIENT_ID) {
     if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, false);
    return;
  }
  try {
    window.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPES, // Updated scopes for userinfo only
      callback: tokenResponseCallback, 
    });
    gisInited = true;
    if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, gisInited);
  } catch (error) {
    console.error("Error initializing GIS client:", error);
    if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, false);
  }
};

const tokenResponseCallback = async (resp: any) => {
  if (resp.error) {
    console.error('Google token error:', resp.error);
    currentGoogleUser = null;
    if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited);
    return;
  }
  // Store the token in gapi.client for potential use by other gapi calls (though not strictly needed for direct fetch)
  window.gapi.client.setToken({ access_token: resp.access_token });
  await fetchUserProfile(resp.access_token); 
};

const fetchUserProfile = async (accessToken: string) => {
    if (!accessToken) {
        console.error("No access token provided for fetching user profile.");
        currentGoogleUser = null;
        if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited);
        return;
    }
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Failed to fetch user profile: ${response.status} ${errorData.message || response.statusText}`);
        }
        const profileData = await response.json();
        currentGoogleUser = {
            email: profileData.email,
            name: profileData.name,
            picture: profileData.picture,
        };
        if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, gisInited);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        currentGoogleUser = null;
        if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited);
    }
};

export const handleSignIn = () => {
  if (!gisInited || !window.tokenClient) {
    console.error("GIS not ready or tokenClient not initialized.");
    alert("Google Sign-In is not ready. Please try again in a moment.");
    return;
  }
  window.tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const handleSignOut = () => {
  const token = window.gapi.client.getToken();
  if (token && token.access_token) { 
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      console.log('Access token revoked.');
    });
  }
  window.gapi.client.setToken(null);
  currentGoogleUser = null;
  if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited);
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};
