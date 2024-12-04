import fetch from "node-fetch";

const BASE_URL = process.env.COMMERCE_API_BASE_URL;
const AUTH_URL = process.env.COMMERCE_AUTH_URL;
const CLIENT_ID = process.env.COMMERCE_CLIENT_ID;
const CLIENT_SECRET = process.env.COMMERCE_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

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

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000; // Token expiry in ms

  return cachedToken;
}

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