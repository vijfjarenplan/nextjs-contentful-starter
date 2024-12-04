import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const soldToNumber = searchParams.get("soldToNumber");

  const baseUrl = process.env.S4HANA_API_URL;
  const endpoint = "API_SALES_ORDER_SRV/A_SalesOrder";
  const queryParams = soldToNumber
    ? `?$filter=SoldToParty eq '${soldToNumber}'&$top=50&$inlinecount=allpages`
    : "?$top=50&$inlinecount=allpages";

  const url = `${baseUrl}${endpoint}${queryParams}`;
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}