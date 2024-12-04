"use client";

import { useState, useEffect } from "react";
import { MEDIA_URL } from "../../../utils/commerce";

export default function ProductDetailsPage({ params }) {
  const [productCode, setProductCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null); // Main product image
  const [mainImageGalleryIndex, setMainImageGalleryIndex] = useState(null); // Current main image galleryIndex
  const [zoomed, setZoomed] = useState(false); // Zoom toggle state
  const [zoomImage, setZoomImage] = useState(null); // Zoom image URL
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 }); // Dragging position
  const [isDragging, setIsDragging] = useState(false); // Dragging state
  const [currentIndex, setCurrentIndex] = useState(0); // Starting index for visible thumbnails

  useEffect(() => {
    (async () => {
      try {
        const resolvedParams = await params;
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
        if (!response.ok) throw new Error("Failed to fetch product details");

        const data = await response.json();

        // Find and set the initial main image (galleryIndex: 0)
        const initialImage = data.images?.find(
          (image) => image.format === "product" && image.galleryIndex === 0
        );

        if (!initialImage) throw new Error("No image found for galleryIndex: 0");

        const fullImageUrl = initialImage.url.startsWith("/medias")
          ? `${MEDIA_URL}${initialImage.url}`
          : initialImage.url;

        setMainImage(fullImageUrl);
        setMainImageGalleryIndex(0);

        const galleryImages = data.images
          ?.filter((image) => image.format === "thumbnail" && image.imageType === "GALLERY")
          .map((image) => ({
            ...image,
            url: image.url.startsWith("/medias") ? `${MEDIA_URL}${image.url}` : image.url,
          }));

        setProduct({ ...data, galleryImages });
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
    const selectedImage = product.images?.find(
      (image) => image.format === "product" && image.galleryIndex === galleryIndex
    );

    const fullImageUrl = selectedImage?.url.startsWith("/medias")
      ? `${MEDIA_URL}${selectedImage.url}`
      : selectedImage?.url;

    setMainImage(fullImageUrl || "/media/placeholder.png");
    setMainImageGalleryIndex(galleryIndex);
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

      const fullZoomUrl = zoomImageEntry?.url.startsWith("/medias")
        ? `${MEDIA_URL}${zoomImageEntry.url}`
        : zoomImageEntry?.url;

      setZoomImage(fullZoomUrl || mainImage);
    }

    setZoomed((prevZoomed) => !prevZoomed);
    setDragPosition({ x: 0, y: 0 });
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

  const handleNextThumbnail = () => {
    if (!product?.galleryImages) return;
    setCurrentIndex((prev) =>
      prev + 1 >= product.galleryImages.length ? 0 : prev + 1
    );
  };

  const handlePreviousThumbnail = () => {
    if (!product?.galleryImages) return;
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? product.galleryImages.length - 1 : prev - 1
    );
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
        <div className="flex items-center justify-center w-full max-w-lg mt-4">
          <button
            onClick={handlePreviousThumbnail}
            className="text-2xl font-bold text-gray-500 hover:text-blue-500"
          >
            &#x276E;
          </button>
          <div className="flex overflow-hidden space-x-2 px-4">
            {product.galleryImages
              .slice(currentIndex, currentIndex + 3) // Show 3 thumbnails at a time
              .map((image, idx) => (
                <img
                  key={idx}
                  src={image.url || "/media/placeholder.png"}
                  alt={`Gallery ${idx}`}
                  onClick={() => handleGalleryClick(image.galleryIndex)}
                  className="w-24 h-24 object-contain cursor-pointer"
                />
              ))}
          </div>
          <button
            onClick={handleNextThumbnail}
            className="text-2xl font-bold text-gray-500 hover:text-blue-500"
          >
            &#x276F;
          </button>
        </div>
      )}
      <p dangerouslySetInnerHTML={{ __html: product?.description }} className="mt-4" />
      <p className="text-lg font-bold mt-4">Price: {product?.price?.formattedValue}</p>
    </div>
  );
}