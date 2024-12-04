"use client";

import { useState, useEffect } from "react";
import { MEDIA_URL } from "../../src/utils/commerce";

export default function ProductDetailsPage({ params }) {
  const [productCode, setProductCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For gallery navigation
  const [mainImage, setMainImage] = useState(null); // Main product image
  const [mainImageGalleryIndex, setMainImageGalleryIndex] = useState(null); // Current main image galleryIndex
  const [zoomed, setZoomed] = useState(false); // Zoom toggle state
  const [zoomImage, setZoomImage] = useState(null); // Zoom image URL
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 }); // Dragging position
  const [isDragging, setIsDragging] = useState(false); // Dragging state

  useEffect(() => {
    // Unwrap params asynchronously
    (async () => {
      try {
        const resolvedParams = await params; // Await params to resolve
        setProductCode(resolvedParams.code);
      } catch (err) {
        console.error("Error resolving params:", err.message);
        setError("Failed to resolve parameters.");
        setLoading(false);
      }
    })();
  }, [params]);

  useEffect(() => {
    if (!productCode) return;

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/getProducts/details?code=${productCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();

        // Replace initial main image with galleryIndex: 0 image
        const initialMainImage = data.images?.find(
          (image) => image.format === "product" && image.galleryIndex === 0
        );

        if (!initialMainImage) {
          throw new Error("No image with galleryIndex: 0 found for main image.");
        }

        const fullImageUrl = initialMainImage.url
          ? (initialMainImage.url.startsWith("/medias")
              ? `${MEDIA_URL}${initialMainImage.url}`
              : initialMainImage.url)
          : "/media/placeholder.png";

        // Replace gallery thumbnail with galleryIndex: 0 thumbnail
        const galleryImages = data.images
          ?.filter(
            (image) =>
              image.format === "thumbnail" &&
              image.imageType === "GALLERY" &&
              image.galleryIndex !== undefined
          )
          .map((image) => ({
            ...image,
            url: image.url.startsWith("/medias")
              ? `${MEDIA_URL}${image.url}`
              : image.url,
          })) || [];

        // Reorder the thumbnail array so the galleryIndex: 0 thumbnail comes first
        const reorderedGalleryImages = [
          ...galleryImages.filter((img) => img.galleryIndex === 0),
          ...galleryImages.filter((img) => img.galleryIndex !== 0),
        ];

        setMainImage(fullImageUrl); // Set the main product image
        setMainImageGalleryIndex(0); // Explicitly set galleryIndex 0
        setProduct({
          ...data,
          galleryImages: reorderedGalleryImages, // Update gallery images
        });
      } catch (err) {
        console.error("Error fetching product details:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productCode]);

  const handleGalleryClick = (galleryIndex) => {
    const galleryImage = product.images?.find(
      (image) =>
        image.format === "product" &&
        image.imageType === "GALLERY" &&
        image.galleryIndex === galleryIndex
    );

    const fullImageUrl = galleryImage?.url
      ? (galleryImage.url.startsWith("/medias")
          ? `${MEDIA_URL}${galleryImage.url}`
          : galleryImage.url)
      : "/media/placeholder.png";

    setMainImage(fullImageUrl); // Update the main image
    setMainImageGalleryIndex(galleryIndex); // Update the galleryIndex
  };

  const toggleZoom = () => {
    if (mainImageGalleryIndex === null) return;

    if (!zoomed) {
      const zoomImageEntry = product.images?.find(
        (image) =>
          image.format === "zoom" &&
          image.imageType === "GALLERY" &&
          image.galleryIndex === mainImageGalleryIndex
      );

      const fullZoomUrl = zoomImageEntry?.url
        ? (zoomImageEntry.url.startsWith("/medias")
            ? `${MEDIA_URL}${zoomImageEntry.url}`
            : zoomImageEntry.url)
        : mainImage;

      setZoomImage(fullZoomUrl); // Set the zoom image
    }

    setZoomed((prevZoomed) => !prevZoomed); // Toggle zoom state
    setDragPosition({ x: 0, y: 0 }); // Reset position when zoom toggled
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomed) {
      setDragPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{product?.name}</h1>
      <div
        className={`relative group w-full max-w-lg h-96 overflow-hidden rounded-lg mb-4 ${
          zoomed ? "cursor-grab" : "cursor-zoom-in"
        }`}
        onClick={toggleZoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={zoomed ? zoomImage : mainImage || "/media/placeholder.png"}
          alt={product?.name || "Product Image"}
          style={{
            transform: `scale(${zoomed ? 2 : 1}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
            transition: zoomed ? "none" : "transform 0.3s",
          }}
          className="w-full h-full object-contain"
        />
      </div>
      {/* Gallery */}
      {product?.galleryImages?.length > 0 && (
        <div className="relative w-full max-w-lg mt-4">
          <div className="flex overflow-hidden">
            {product.galleryImages.map((image, idx) => (
              <img
                key={idx}
                src={image.url || "/media/placeholder.png"}
                alt={`Gallery ${idx}`}
                onClick={() => handleGalleryClick(image.galleryIndex)}
                className="w-1/3 h-24 object-contain mx-1 rounded-lg border cursor-pointer hover:border-blue-500"
              />
            ))}
          </div>
        </div>
      )}
      <p dangerouslySetInnerHTML={{ __html: product?.description }} className="mt-4" />
      <p className="text-lg font-bold mt-4">Price: {product?.price?.formattedValue}</p>
    </div>
  );
}