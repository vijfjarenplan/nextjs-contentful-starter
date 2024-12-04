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
  const [quantity, setQuantity] = useState(1); // Quantity selector
  const [activeTab, setActiveTab] = useState("description"); // Active tab
  const [currentIndex, setCurrentIndex] = useState(0); // Starting index for visible thumbnails
  const [zoomedImage, setZoomedImage] = useState(null); // Zoom variant for modal view
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false); // Zoom modal state

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

  const handleZoomClick = () => {
    const zoomVariant = product.images?.find(
      (image) => image.format === "zoom" && image.galleryIndex === mainImageGalleryIndex
    );

    const zoomImageUrl = zoomVariant?.url.startsWith("/medias")
      ? `${MEDIA_URL}${zoomVariant.url}`
      : zoomVariant?.url;

    setZoomedImage(zoomImageUrl || mainImage);
    setIsZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
  };

  const handleZoomPrevious = () => {
    const previousIndex =
      mainImageGalleryIndex - 1 < 0
        ? product.images.length - 1
        : mainImageGalleryIndex - 1;

    const zoomVariant = product.images?.find(
      (image) => image.format === "zoom" && image.galleryIndex === previousIndex
    );

    const zoomImageUrl = zoomVariant?.url.startsWith("/medias")
      ? `${MEDIA_URL}${zoomVariant.url}`
      : zoomVariant?.url;

    setZoomedImage(zoomImageUrl || mainImage);
    setMainImageGalleryIndex(previousIndex);
  };

  const handleZoomNext = () => {
    const nextIndex =
      mainImageGalleryIndex + 1 >= product.images.length
        ? 0
        : mainImageGalleryIndex + 1;

    const zoomVariant = product.images?.find(
      (image) => image.format === "zoom" && image.galleryIndex === nextIndex
    );

    const zoomImageUrl = zoomVariant?.url.startsWith("/medias")
      ? `${MEDIA_URL}${zoomVariant.url}`
      : zoomVariant?.url;

    setZoomedImage(zoomImageUrl || mainImage);
    setMainImageGalleryIndex(nextIndex);
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

  const adjustQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Section */}
        <div>
          <div
            className="relative group w-full h-96 overflow-hidden rounded-lg mb-4 cursor-zoom-in"
            onClick={handleZoomClick}
          >
            <img
              src={mainImage || "/media/placeholder.png"}
              alt={product?.name || "Product Image"}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Thumbnail Carousel */}
          {product?.galleryImages?.length > 0 && (
            <div className="flex items-center justify-center mt-4 space-x-2">
              <button
                onClick={handlePreviousThumbnail}
                className="text-2xl font-bold text-gray-500 hover:text-blue-500"
              >
                &#x276E;
              </button>
              <div className="flex overflow-hidden space-x-2">
                {product.galleryImages
                  .slice(currentIndex, currentIndex + 3) // Show 3 thumbnails at a time
                  .map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url || "/media/placeholder.png"}
                      alt={`Gallery ${idx}`}
                      onClick={() => handleGalleryClick(image.galleryIndex)}
                      className={`w-20 h-20 object-contain cursor-pointer ${
                        image.galleryIndex === mainImageGalleryIndex
                          ? "opacity-100"
                          : "opacity-70"
                      } hover:opacity-100`}
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
        </div>

        {/* Product Information */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product?.name}</h1>
          <p className="text-lg font-bold mb-4">Price: {product?.price?.formattedValue}</p>

          {/* Quantity Selector and Add to Cart */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => adjustQuantity(-1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-12 text-center border-l border-r border-gray-300"
              />
              <button
                onClick={() => adjustQuantity(1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>

          {/* Promotional Messages */}
          <div className="space-y-2 text-gray-600 mb-6">
            <p>Orders over €50 ship free.</p>
            <p>Worry-free guarantee included.</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300 mb-4">
            <div className="flex space-x-4">
              {["description", "specifications", "shipping", "how-to-use", "find-in-store"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`pb-2 ${
                      activeTab === tab
                        ? "text-blue-500 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-blue-500"
                    }`}
                  >
                    {tab.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "description" && (
              <div dangerouslySetInnerHTML={{ __html: product?.description }} />
            )}
            {activeTab === "specifications" && <p>Specifications will go here.</p>}
            {activeTab === "shipping" && <p>Shipping information will go here.</p>}
            {activeTab === "how-to-use" && <p>How to use details will go here.</p>}
            {activeTab === "find-in-store" && <p>Find in store locations will go here.</p>}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded shadow-lg max-w-full max-h-full">
            <button
              onClick={closeZoomModal}
              className="absolute top-4 right-4 text-black text-3xl font-bold cursor-pointer"
            >
              &#x2715; {/* X Close */}
            </button>
            <button
              onClick={handleZoomPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black text-3xl font-bold cursor-pointer"
            >
              &#x276E; {/* Previous */}
            </button>
            <img
              src={zoomedImage || "/media/placeholder.png"}
              alt="Zoomed Product Image"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={handleZoomNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black text-3xl font-bold cursor-pointer"
            >
              &#x276F; {/* Next */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}