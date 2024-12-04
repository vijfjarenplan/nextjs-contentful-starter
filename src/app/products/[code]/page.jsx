"use client";

import { useEffect, useState } from "react";

export default function ProductDetailsPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/getProducts/details?code=${params.code}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.code]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{product?.name}</h1>
      <img
        src={product?.images?.[0]?.url || "/placeholder.png"}
        alt={product?.name}
        className="w-full h-96 object-cover mb-4"
      />
      <p>{product?.description}</p>
      <p className="text-lg font-bold mt-4">
        Price: {product?.price?.formattedValue}
      </p>
    </div>
  );
}