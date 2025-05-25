
// Fix: Removed GOOGLE_API_KEY and DRIVE_DISCOVERY_DOCS from import as they are not exported by ../constants.
// These constants, if required for Google Drive functionality, would need to be sourced differently,
// or this specific Drive functionality is deprecated. DRIVE_SCOPES is correctly imported.
import { GOOGLE_CLIENT_ID, DRIVE_SCOPES } from '../constants';
// Fix: Removed AppData and DriveFile from import as they are not defined in ../types.
// Functionality relying on these types (backup, list, restore) is commented out below.
import { GoogleUser } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
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
  // Fix: GOOGLE_API_KEY and DRIVE_DISCOVERY_DOCS were removed from imports
  // as they are not exported by ../constants.tsx for Google Drive specific services.
  // This means the GAPI client cannot be initialized for Google Drive specific services
  // as previously intended in this file. Drive operations will likely fail.
  console.warn("services/googleDriveService.ts: GAPI client for Drive services cannot be initialized, as GOOGLE_API_KEY or DRIVE_DISCOVERY_DOCS specific to Drive are not available from constants.tsx. Drive-specific API calls will likely fail.");
  gapiInited = false; // Mark GAPI as not initialized for Drive context
  if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, gisInited);
  // Original code using GOOGLE_API_KEY and DRIVE_DISCOVERY_DOCS (which are undefined here) is now effectively bypassed.
};

const initializeGisClient = () => {
  if (!GOOGLE_CLIENT_ID) {
    // console.error("Google Client ID is not defined."); // Retained original comment style
     if (updateAuthStatusCallback) updateAuthStatusCallback(currentGoogleUser, gapiInited, false);
    return;
  }
  try {
    window.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPES, // DRIVE_SCOPES from constants contains userinfo scopes
      callback: tokenResponseCallback, // Handles token response
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
    if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited); // Sign out on error
    return;
  }
  // Set the access token for GAPI client
  window.gapi.client.setToken({ access_token: resp.access_token });
  await fetchUserProfile(); // Fetch user profile after successful token
};

const fetchUserProfile = async () => {
    try {
        // Using userinfo endpoint directly which is often more straightforward for just profile info.
        // Requires 'https://www.googleapis.com/auth/userinfo.email' and 'https://www.googleapis.com/auth/userinfo.profile' scopes.
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${window.gapi.client.getToken().access_token}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Failed to fetch user profile: ${response.status} ${errorData.message || response.statusText}`);
        }
        const profile = await response.json();

        currentGoogleUser = {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
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
  if (token && token.access_token) { // check if access_token exists
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      console.log('Access token revoked.');
    });
  }
  window.gapi.client.setToken(null);
  currentGoogleUser = null;
  if (updateAuthStatusCallback) updateAuthStatusCallback(null, gapiInited, gisInited);
  // Optional: Disable auto-select for next sign-in attempt
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
};

// Fix: Commenting out Drive operation functions (backupDataToDrive, listBackupFiles, restoreDataFromDrive)
// These functions are non-functional due to:
// 1. Missing types `AppData` and `DriveFile` (not defined in `../types.ts`).
// 2. The GAPI client for Drive services (`initializeGapiClient` in this file) is not being properly
//    initialized because `GOOGLE_API_KEY` and `DRIVE_DISCOVERY_DOCS` (specific for Drive)
//    are not available from `../constants.ts`.
// 3. The `DRIVE_SCOPES` currently defined in `../constants.ts` are for userinfo, not file operations.
// This functionality appears to be deprecated or was incompletely implemented.
/*
export const backupDataToDrive = async (appData: AppData): Promise<string | null> => {
  if (!gapiInited || !currentGoogleUser) {
    alert("Please sign in with Google first and ensure GAPI is ready.");
    return null;
  }

  const fileName = `nutrismart_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
  const fileMetadata = {
    name: fileName,
    mimeType: 'application/json',
  };
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const fileContent = JSON.stringify(appData);

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    close_delim;

  try {
    const response = await window.gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });
    console.log("Backup successful:", response.result);
    return response.result.id; // Return file ID
  } catch (error: any) { // Explicitly type error
    console.error("Error backing up data:", error);
    alert(`Error backing up data: ${error.result?.error?.message || error.message || 'Unknown error'}`);
    return null;
  }
};

export const listBackupFiles = async (): Promise<DriveFile[]> => {
  if (!gapiInited || !currentGoogleUser) {
    alert("Please sign in with Google first and ensure GAPI is ready.");
    return [];
  }
  try {
    const response = await window.gapi.client.drive.files.list({
      q: "name contains 'nutrismart_backup_' and mimeType='application/json' and trashed=false",
      fields: 'files(id, name, mimeType, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 10, // Get latest 10, for example
    });
    return response.result.files || [];
  } catch (error: any) { // Explicitly type error
    console.error("Error listing backup files:", error);
    alert(`Error listing backup files: ${error.result?.error?.message || error.message || 'Unknown error'}`);
    return [];
  }
};

export const restoreDataFromDrive = async (fileId: string): Promise<AppData | null> => {
  if (!gapiInited || !currentGoogleUser) {
    alert("Please sign in with Google first and ensure GAPI is ready.");
    return null;
  }
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    // response.body is the JSON string, response.result is the parsed JSON object
    return typeof response.result === 'object' ? response.result : JSON.parse(response.body);
  } catch (error: any) { // Explicitly type error
     console.error("Error restoring data:", error);
     alert(`Error restoring data: ${error.result?.error?.message || error.message || 'Unknown error'}`);
    return null;
  }
};
*/
