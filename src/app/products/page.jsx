"use client";

import { useState } from "react";
import { MEDIA_URL } from "../../utils/commerce"; // Ensure MEDIA_URL is imported

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // State for toggling view mode

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/getProducts/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products. Status: ${response.status}`);
      }

      const data = await response.json();

      // Process products
      const updatedProducts = data.products.map((product) => {
        const fullImageUrl = product.firstVariantImage
          ? (product.firstVariantImage.startsWith("/medias")
              ? `${MEDIA_URL}${product.firstVariantImage}`
              : product.firstVariantImage)
          : "/media/placeholder.png";

        return {
          ...product,
          images: [{ url: fullImageUrl }],
        };
      });

      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Products</h1>

      {/* Search Input */}
      <div className="mb-4">
        <label htmlFor="query" className="block text-sm font-medium mb-2">
          Enter Search Query:
        </label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
        <button
          onClick={fetchProducts}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* View Mode Switcher */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded-l ${
            viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Card View
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-r ${
            viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          List View
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Product Listing */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <a
              key={product.code}
              href={`/products/${product.code}`}
              className="border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200">
                <img
                  src={product.images?.[0]?.url || "/media/placeholder.png"}
                  alt={product.name || "Placeholder Image"}
                  onError={(e) => (e.target.src = "/media/placeholder.png")} // Fallback for broken images
                  className="w-full h-full object-contain rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">{product.price?.formattedValue}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.code}
              className="flex items-center border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow p-4"
            >
              <div className="w-24 aspect-w-1 aspect-h-1 bg-gray-200">
                <img
                  src={product.images?.[0]?.url || "/media/placeholder.png"}
                  alt={product.name || "Placeholder Image"}
                  onError={(e) => (e.target.src = "/media/placeholder.png")} // Fallback for broken images
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="ml-4 flex-1">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">{product.price?.formattedValue}</p>
              </div>
              <a
                href={`/products/${product.code}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && products.length === 0 && (
        <p className="text-gray-500">No products found. Try a different query.</p>
      )}
    </div>
  );
}