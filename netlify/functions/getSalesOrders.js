const fetch = require("node-fetch");

exports.handler = async function () {
  const baseUrl = process.env.S4HANA_API_URL; // Base URL stored in environment variable
  const endpoint = "API_SALES_ORDER_SRV/A_SalesOrder"; // Specific API endpoint
  const queryParams = "?$top=50&$inlinecount=allpages"; // Query parameters
  const url = `${baseUrl}${endpoint}${queryParams}`; // Combine to form the full URL

  const username = process.env.S4HANA_USERNAME;
  const password = process.env.S4HANA_PASSWORD;

  // Create Basic Authentication header
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.statusText }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};