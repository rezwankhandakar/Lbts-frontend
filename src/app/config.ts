const DEFAULT_API_URL = 'http://localhost:5000/api/v1'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl && import.meta.env.DEV) {
  console.warn(`VITE_API_URL is not set - falling back to ${DEFAULT_API_URL}. See .env.example.`)
}

export const config = {
  apiUrl: apiUrl || DEFAULT_API_URL,
  /**
   * Render's free tier spins the API down after ~15 minutes idle; the first
   * request after that pays the cold start. See CLAUDE.md.
   */
  apiTimeoutMs: 60_000,
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
} as const
