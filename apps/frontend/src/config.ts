
// Helper to construct the API URL correctly
export const getApiUrl = (endpoint: string) => {
    // 1. Get Base URL from Env or Default to PROD
    let baseUrl = import.meta.env.VITE_API_URL || 'https://lomash-backend.onrender.com/api/v1';

    // 2. Remove trailing slash from base if present
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    // 3. Ensure Base URL ends with /api/v1 if it doesn't already
    if (!baseUrl.includes('/api/v1')) {
        baseUrl = `${baseUrl}/api/v1`;
    }

    // 4. Clean up endpoint (remove leading slash if present)
    if (endpoint.startsWith('/api/v1')) {
        endpoint = endpoint.replace('/api/v1', '');
    }

    if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
    }

    return `${baseUrl}${endpoint}`;
};
