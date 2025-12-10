// This base URL will be:
// - "" (empty string) in development, relying on Vite proxy to forward /api requests
// - "https://your-backend.com" in production, pointing directly to the API
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';
