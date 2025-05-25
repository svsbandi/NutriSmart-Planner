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

2.  **Environment Variable Setup (API Keys)**:
    This project requires API keys for Google Gemini and a Google Cloud Client ID for Google Sign-In. These are managed via environment variables for local development.

    *   **Create a `.env` file**:
        In the root directory of the project, create a new file named `.env`. This file will store your API keys.

    *   **Add API Keys to `.env`**:
        Open the `.env` file and add your keys using the following format, replacing the placeholder values with your actual keys:
        ```env
        VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
        VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
        ```
        *   `VITE_GEMINI_API_KEY`: Your API key for Google Gemini (used for AI-powered features like meal planning and the AI coach).
        *   `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID (obtained from Google Cloud Console) for enabling Google Sign-In functionality.

    *   **Security Note (`.gitignore`)**:
        The `.env` file contains sensitive information and should **NEVER** be committed to version control. Ensure that `.env` is listed in your project's `.gitignore` file. Most Vite projects include this by default.
        The `api_keys_reference.txt` file has been updated to provide instructions on this new `.env` setup and no longer stores keys.

3.  **Google Cloud Project Setup (for Sign-In Client ID)**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Enable the **Google People API** (this is often implicitly used by `userinfo.email` and `userinfo.profile` scopes, but good to ensure it's available if specific issues arise). The Google Drive API is no longer needed.
    *   Go to "APIs & Services" -> "Credentials".
    *   Create an **OAuth 2.0 Client ID**:
        *   Application type: **Web application**.
        *   Authorized JavaScript origins: Add your development server's origin (e.g., `http://localhost:3000`, `http://127.0.0.1:5500` - check the port your server uses).
        *   Authorized redirect URIs: Usually not strictly needed for this GIS token flow, but good practice to add your app's origin here too.
    *   Copy the "OAuth 2.0 Client ID" and use it for the `VITE_GOOGLE_CLIENT_ID` value in your `.env` file.
    *   An "API Key" from Google Cloud (like the one previously used for Drive services) is no longer required for the Google Sign-In functionality.

4.  **Gemini API Key**:
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get your Gemini API Key.
    *   Use this key for the `VITE_GEMINI_API_KEY` value in your `.env` file.

5.  **Install Dependencies (if any)**:
    *   This project primarily uses CDN-linked libraries (React, TailwindCSS). However, if any local development tools or linters were added that require `npm install`, run:
        ```bash
        npm install # or yarn install
        ```
    *   For the current setup, this step might not be strictly necessary if you are only using a static server.

6.  **Serve the Application**:
    *   Since this project uses ES modules directly, Tailwind via CDN, and now Vite-style environment variables (`import.meta.env`), you'll need a development server that supports this, or a build step.
    *   **Using Vite (Recommended for `import.meta.env` compatibility)**:
        If Vite is not already set up (e.g., `vite.config.ts` exists, `package.json` has Vite scripts):
        ```bash
        # If you don't have a package.json, create one: npm init -y
        npm install vite
        # Create a vite.config.ts if needed (see project structure for example)
        # Add scripts to package.json:
        # "dev": "vite",
        # "build": "vite build",
        # "preview": "vite preview"
        npm run dev
        ```
    *   **Alternative (Simple HTTP Server - `import.meta.env` might not work directly)**:
        If you use a simple server like Python's `http.server` or VS Code Live Server, `import.meta.env` will not be populated from the `.env` file. This project's code now relies on `import.meta.env`.
        For the application to function correctly with API keys, **using Vite (or a similar tool that handles `.env` files for client-side JavaScript) is now necessary.**
        ```bash
        # Example with Python (API keys won't work without Vite or similar)
        # python -m http.server
        ```
    *   Open your browser to the local address provided by Vite (usually `http://localhost:5173` or similar).

## How API Keys are Used

*   The JavaScript code (in `services/geminiService.ts` and `constants.tsx`) is now configured to access API keys using `import.meta.env.VITE_GEMINI_API_KEY` and `import.meta.env.VITE_GOOGLE_CLIENT_ID`.
*   This is a standard way to handle environment variables in projects built with Vite (or similar build tools). Vite automatically loads variables from your `.env` file and makes them available in your client-side code via the `import.meta.env` object.
*   The `api_keys_reference.txt` file now only contains instructions for setting up your `.env` file.

## Important Notes

*   **API Key Security**: The most crucial point is to **never commit your `.env` file** (or any file containing your actual API keys) to a version control repository. Ensure `.env` is in your `.gitignore` file.
*   **Google Scopes**: The application requests `userinfo.email` and `userinfo.profile` scopes for Google Sign-In.
*   **Error Handling**: The application includes basic error handling for API calls and UI feedback, but this can always be enhanced.

## Contributing

This project is primarily a demonstration. For contributions, please fork the repository and submit a pull request.

---

*NutriSmart Planner - AI-Powered Nutrition for a Healthier You.*
