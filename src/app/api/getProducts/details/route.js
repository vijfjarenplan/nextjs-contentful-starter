import { commerceRequest } from "../../../../utils/commerce";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productCode = searchParams.get("code");

  if (!productCode) {
    return new Response(
      JSON.stringify({ error: "Product code is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const data = await commerceRequest(`powertools-spa/products/${productCode}`, {
      fields: "FULL", // Adjust fields based on your requirements
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}