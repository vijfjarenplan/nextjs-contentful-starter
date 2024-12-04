import fetch from "node-fetch";

export const MEDIA_URL = process.env.NEXT_PUBLIC_COMMERCE_MEDIA_URL;
const BASE_URL = process.env.COMMERCE_API_BASE_URL;
const AUTH_URL = process.env.COMMERCE_AUTH_URL;
const CLIENT_ID = process.env.COMMERCE_CLIENT_ID;
const CLIENT_SECRET = process.env.COMMERCE_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get a valid access token for the Commerce API.
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    console.log("Using cached token.");
    return cachedToken;
  }

  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    console.log("Access token response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Access token error details:", errorData);
      throw new Error(`Failed to fetch access token: ${response.status}`);
    }

    const data = await response.json();
    console.log("Access token fetched successfully:", data);

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000; // Token expiry in ms

    return cachedToken;
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    throw error;
  }
}

/**
 * Make a request to the Commerce API.
 * @param {string} endpoint - The API endpoint to call.
 * @param {Object} params - Query parameters to include in the request.
 */
export async function commerceRequest(endpoint, params = {}) {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Commerce API error: ${response.status} - ${error.message || response.statusText}`
    );
  }

  return response.json();
}

// Export MEDIA_URL and BASE_URL for use in other files
export {  BASE_URL };