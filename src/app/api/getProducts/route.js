import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const query = searchParams.get("query") || "";
  const baseSiteId = searchParams.get("baseSiteId") || "powertools-spa";
  const currentPage = searchParams.get("currentPage") || 0;
  const pageSize = searchParams.get("pageSize") || 20;

  // Environment variables
  const baseUrl = process.env.COMMERCE_API_BASE_URL;
  const authUrl = process.env.COMMERCE_AUTH_URL;
  const clientId = process.env.COMMERCE_CLIENT_ID;
  const clientSecret = process.env.COMMERCE_CLIENT_SECRET;

  // Fetch the access token
  try {
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
      console.error("Failed to fetch access token");
      return NextResponse.json(
        { error: "Failed to fetch access token" },
        { status: authResponse.status }
      );
    }

    const { access_token } = await authResponse.json();

    // Construct the product search URL
    const searchUrl = `${baseUrl}${baseSiteId}/products/search?query=${encodeURIComponent(
      query
    )}&currentPage=${currentPage}&pageSize=${pageSize}&fields=DEFAULT`;

    // Fetch products
    const productResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    if (!productResponse.ok) {
      console.error("Failed to fetch products");
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: productResponse.status }
      );
    }

    const productData = await productResponse.json();
    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}