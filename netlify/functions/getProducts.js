const fetch = require("node-fetch");

exports.handler = async function (event) {
  const baseUrl = process.env.COMMERCE_API_BASE_URL;
  const authUrl = process.env.COMMERCE_AUTH_URL;
  const clientId = process.env.COMMERCE_CLIENT_ID;
  const clientSecret = process.env.COMMERCE_CLIENT_SECRET;

  // Query parameters from the request
  const { baseSiteId = "powertools-spa", query = "", currentPage = 0, pageSize = 20 } =
    event.queryStringParameters || {};

  // Fetch access token
  const authResponse = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!authResponse.ok) {
    return {
      statusCode: authResponse.status,
      body: JSON.stringify({ error: "Failed to fetch access token" }),
    };
  }

  const { access_token } = await authResponse.json();

  // Build the product search API URL
  const searchUrl = `${baseUrl}${baseSiteId}/products/search?query=${encodeURIComponent(
    query
  )}&currentPage=${currentPage}&pageSize=${pageSize}&fields=DEFAULT`;

  // Fetch products
  try {
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch products" }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};