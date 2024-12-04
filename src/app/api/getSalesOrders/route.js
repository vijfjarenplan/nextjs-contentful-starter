import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const soldToNumber = searchParams.get("soldToNumber");

  // Read baseUrl from environment variables
  const baseUrl = process.env.S4HANA_API_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "S4HANA_API_URL is not defined" }, { status: 500 });
  }

  const endpoint = "API_SALES_ORDER_SRV/A_SalesOrder";
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
      return NextResponse.json({ error: response.statusText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching sales orders:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}