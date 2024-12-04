const fetch = require("node-fetch");

exports.handler = async function (event) {
  const baseUrl = process.env.S4HANA_API_URL;
  const endpoint = "API_SALES_ORDER_SRV/A_SalesOrder";

  // Get the Sold-to number from query parameters
  const { soldToNumber } = event.queryStringParameters || {};
  const queryParams = soldToNumber
    ? `?$filter=SoldToParty eq '${soldToNumber}'&$top=50&$inlinecount=allpages`
    : "?$top=50&$inlinecount=allpages";

  const url = `${baseUrl}${endpoint}${queryParams}`;
  console.log("Request URL:", url); // Debugging

  const username = process.env.S4HANA_USERNAME;
  const password = process.env.S4HANA_PASSWORD;
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