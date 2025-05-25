# NutriSmart Planner

NutriSmart Planner is an AI-powered meal planning application designed to help users create personalized nutrition plans. It considers user profiles, health conditions, dietary preferences, and activity levels to generate comprehensive meal strategies, grocery lists, and more.

## Key Features

*   **User Profiles**: Manage multiple user profiles with details like age group, dietary preferences (Vegetarian, Non-Vegetarian, Vegan), health conditions (Diabetes, Hypertension, etc.), medications, and activity levels.
*   **Family Mode**: Support for multiple family members, combined grocery lists, and unified meal planning with individual flexibility (conceptual).
*   **AI-Powered Weekly Meal Planner**:
    *   Generates 7-day meal plans automatically using the Gemini API.
    *   Considers caloric needs, protein intake, micronutrients, and medical conditions.
    *   Recommends balanced meals with Indian/Global options.
    *   Supports modes like Balanced, Weight Loss, Festive, or Light Meals.
*   **Protein-Rich Food Suggestions**: Get AI-driven suggestions for protein sources tailored to user diet (Vegetarian, Non-Vegetarian, Vegan) and needs.
*   **Special Baby Section (Baby Zone)**: Age-specific (6mo–2 yrs) nutritional guidance including pureed, mashed, and finger food stages, along with tips for weaning and allergies.
*   **Health & Medication-Aware Planning**: AI considers potential food-medication conflicts (e.g., grapefruit with statins) and aims to alert users to nutrient gaps.
*   **Grocery List Generator**: Automatically creates weekly grocery lists based on generated meal plans. Items can also be added manually.
*   **AI Chat Diet Coach**: An interactive chatbot (powered by Gemini API) to answer questions about food, nutrition, meal timing, and more, with context from the active user profile.
*   **Progress Tracker**: Log and visualize progress such as weight and energy levels over time.
*   **Google Sign-In**: Securely sign in with your Google Account to identify users.
*   **Customization & Alerts (Conceptual)**: Future scope for meal reminders, fasting/feasting settings, and target alerts.
*   **Responsive UI**: Designed with Tailwind CSS for a clean, modern, and responsive user experience across devices.

## Tech Stack

*   **Frontend**:
    *   React 19 (using ES Modules via esm.sh)
    *   TypeScript
    *   React Router DOM
    *   Tailwind CSS (via CDN)
    *   Recharts (for charts)
*   **AI & APIs**:
    *   **Google Gemini API** (`@google/genai`): For meal plan generation, protein suggestions, baby food advice, and AI chat coach.
    *   **Google Identity Services (GIS)** & **Google API Client Library (GAPI)**: For Google Sign-In.
*   **Data Storage**:
    *   **Browser Local Storage**: For persisting user data locally.
*   **Icons**: Heroicons (via inline SVGs in `constants.tsx`).
*   **Development Server**: Any simple HTTP server (e.g., VS Code Live Server, `python -m http.server`).

## Project Structure

```
.
├── components/         # Reusable React components
├── pages/              # Page-level components (routed)
├── services/           # Modules for API interactions (Gemini, Google Auth)
├── App.tsx             # Main application component with routing
├── constants.tsx       # App-wide constants (icons, nav links, etc.)
├── index.html          # HTML entry point
├── index.tsx           # React application entry point
├── metadata.json       # Application metadata
├── types.ts            # TypeScript type definitions
├── api_keys_reference.txt # Local API key reference (GIT IGNORED)
├── .gitignore          # Specifies intentionally untracked files
└── README.md           # This file
```

## Setup and Running Locally

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd nutrismart-planner
    ```

2.  **API Keys & Environment Variables**:
    This project requires API keys for Google Gemini and a Google Cloud Client ID (for Sign-In).
    *   **`api_keys_reference.txt` File (For Your Reference)**:
        *   Create a file named `api_keys_reference.txt` in the root of the project (a template is provided).
        *   Store your API keys in this file. This file is ignored by Git (see `.gitignore`) and is **for your reference only**.
            ```
            # In api_keys_reference.txt:
            # This file is for your reference to store API keys locally.
            # Copy these values into the window.APP_CONFIG section in index.html for local development.
            # DO NOT commit this file to version control if it contains your actual keys.

            API_KEY="YOUR_GEMINI_API_KEY"
            GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_FOR_SIGN_IN"
            ```
    *   **`index.html` Configuration (For Local Development)**:
        *   Open the `index.html` file.
        *   Locate the `<script>` block containing `window.APP_CONFIG`.
        *   **Copy your actual API keys from your `api_keys_reference.txt` file** and replace the placeholder values (e.g., `"YOUR_GEMINI_API_KEY_HERE"`) within this `APP_CONFIG` block.
            ```html
            <script>
              // --- START OF APP_CONFIG ---
              window.APP_CONFIG = {
                API_KEY: "YOUR_ACTUAL_GEMINI_API_KEY", // Copied from api_keys_reference.txt
                GOOGLE_CLIENT_ID: "YOUR_ACTUAL_GOOGLE_CLIENT_ID" // Copied from api_keys_reference.txt
              };
              // --- END OF APP_CONFIG ---
            </script>
            ```
        *   **IMPORTANT**: The `index.html` file with your actual keys in `APP_CONFIG` should **NOT** be committed to version control if your repository is public. Keep your keys secure. The `.gitignore` file is configured to ignore `api_keys_reference.txt`.

3.  **Google Cloud Project Setup (for Sign-In)**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Enable the **Google People API** (this is often implicitly used by `userinfo.email` and `userinfo.profile` scopes, but good to ensure it's available if specific issues arise). The Google Drive API is no longer needed.
    *   Go to "APIs & Services" -> "Credentials".
    *   Create an **OAuth 2.0 Client ID**:
        *   Application type: **Web application**.
        *   Authorized JavaScript origins: Add your development server's origin (e.g., `http://localhost:3000`, `http://127.0.0.1:5500` - check the port your server uses).
        *   Authorized redirect URIs: Usually not strictly needed for this GIS token flow, but good practice to add your app's origin here too.
    *   Copy the "OAuth 2.0 Client ID" into the `GOOGLE_CLIENT_ID` field in `index.html`'s `APP_CONFIG` (and your `api_keys_reference.txt` for reference).
    *   An "API Key" (the one previously used for Drive services) is no longer required for the Google Sign-In functionality.

4.  **Gemini API Key**:
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get your Gemini API Key.
    *   Copy this key into the `API_KEY` field in `index.html`'s `APP_CONFIG` (and your `api_keys_reference.txt` for reference).

5.  **Serve the Application**:
    *   Since this project uses ES modules directly and Tailwind via CDN, you can serve `index.html` using any simple static HTTP server.
    *   One common way is using the "Live Server" extension in VS Code.
    *   Alternatively, using Python's built-in HTTP server:
        ```bash
        # For Python 3
        python -m http.server
        # For Python 2
        # python -m SimpleHTTPServer
        ```
    *   Open your browser to the local address provided by the server (e.g., `http://localhost:8000` or `http://127.0.0.1:5500`). The application should now be able to use the API keys you've set in `index.html`.

## How API Keys are Used

*   The JavaScript code (in `constants.tsx` and `services/geminiService.ts`) is now configured to first look for API keys in `window.APP_CONFIG` (which you set in `index.html`).
*   This method is suitable for local development in this simple CDN-based setup, as `process.env` is not automatically populated from a `.env`-style file without a build tool like Webpack or Vite.
*   The `api_keys_reference.txt` file serves as your primary, secure storage location for these keys, and you copy them into `index.html` only when you're actively developing.

## Important Notes

*   **API Key Security**: The most crucial point is to **never commit your actual API keys** into `index.html` (or any other file) if that file is pushed to a public version control repository (like GitHub). Always use `api_keys_reference.txt` as your secure reference and be mindful of what you commit.
*   **Google Scopes**: The application requests `userinfo.email` and `userinfo.profile` scopes for Google Sign-In.
*   **Error Handling**: The application includes basic error handling for API calls and UI feedback, but this can always be enhanced.

## Contributing

This project is primarily a demonstration. For contributions, please fork the repository and submit a pull request.

---

*NutriSmart Planner - AI-Powered Nutrition for a Healthier You.*
