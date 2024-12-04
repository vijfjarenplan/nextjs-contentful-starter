import { commerceRequest } from "../../../../utils/commerce";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const query = searchParams.get("query") || "";
  const currentPage = searchParams.get("currentPage") || 0;
  const pageSize = searchParams.get("pageSize") || 20;

  try {
    const data = await commerceRequest(`powertools-spa/products/search`, {
      query,
      currentPage,
      pageSize,
      fields: "DEFAULT",
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}