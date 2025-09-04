"use client";

import React, { useState, useEffect, use } from "react";
import { Heart, Star, ShoppingCart, Minus, Plus, Share2, Truck, ShieldCheck } from 'lucide-react';
import { addToCart } from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, notFound } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import { motion, AnimatePresence } from "framer-motion";
import { useFbPixel } from "@/hooks/useFbPixel";
import { v4 as uuidv4 } from "uuid";
import { u } from "motion/react-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  attribute: {
    id: number;
    name: string;
  };
}

interface Variation {
  id: number;
  product_id: number;
  price: string;
  stock: number;
  sold_stock: number;
  image_path: string;
  attributes: Array<{
    id: number;
    product_variation_id: number;
    attribute_value_id: number;
    value: AttributeValue;
  }>;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  product_code: string;
  description: string;
  feature_image: string;
  gallery_images: string;
  price: string;
  previous_price: string;
  stock: number;
  sold_stock: number;
  is_free_delivery: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  variations: Variation[];
}

async function getProduct(slug: string) {
  const res = await fetch(`${apiBaseUrl}/product/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export default function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: AttributeValue | null }>({});
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addToCartLoading = useSelector((state: any) => state.cart.loading);
  const dispatch = useDispatch();
  const router = useRouter();

  const { trackAddToCart, trackViewContent } = useFbPixel();

  // Swiper states
  const [mainSwiper, setMainSwiper] = useState<any>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  // Unwrap params using React.use
  const params = React.use(paramsPromise);

  // Fetch product data and set initial state
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(params.slug);

        // Check if productData is valid
        if (!productData || Object.keys(productData).length === 0) {
          notFound(); // Trigger Next.js 404 page
          return;
        }


        setProduct(productData);

        // Initialize selected attributes for variable products
        if (productData?.variations.length > 0) {
          const attributeGroups = getAttributeGroups(productData?.variations);
          const initialAttributes: { [key: string]: AttributeValue | null } = {};
          Object.keys(attributeGroups).forEach((attrName) => {
            const firstAvailable = attributeGroups[attrName].find((item) => item.stock > 0);
            initialAttributes[attrName] = firstAvailable ? firstAvailable.value : attributeGroups[attrName][0]?.value || null;
          });
          setSelectedAttributes(initialAttributes);
          const initialVariation = findVariationByAttributes(productData.variations, initialAttributes);
          setSelectedVariation(initialVariation || null);

          // Set initial slide to variation image or feature image
          const imageToShow = initialVariation?.image_path || productData.feature_image;
          const index = [...new Set([
            productData.feature_image,
            ...(productData.gallery_images ? JSON.parse(productData.gallery_images) : []),
            ...productData.variations.map((v) => v.image_path),
          ])].filter(Boolean).findIndex((img) => img === imageToShow);
          if (mainSwiper && index !== -1) {
            mainSwiper.slideTo(index);
          }
        } else {
          // For simple products, no variation or attributes
          setSelectedVariation(null);
          setSelectedAttributes({});
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug, mainSwiper]);


  useEffect(() => {
    if (product) {
      const eventID = uuidv4();
      trackViewContent(product, eventID, currentPrice);
    }
  }, [product]);

  // Group attributes by name for variable products
  const getAttributeGroups = (variations: Variation[]) => {
    return variations.reduce((acc: { [key: string]: Array<{ variationId: number; stock: number; value: AttributeValue }> }, variation) => {
      variation.attributes.forEach((attr) => {
        const attrName = attr.value.attribute.name;
        if (!acc[attrName]) acc[attrName] = [];
        if (!acc[attrName].some((v) => v.value.id === attr.value.id)) {
          acc[attrName].push({
            variationId: variation.id,
            stock: variation.stock,
            value: attr.value,
          });
        }
      });
      return acc;
    }, {});
  };

  // Find variation matching selected attributes
  const findVariationByAttributes = (variations: Variation[], selectedAttrs: { [key: string]: AttributeValue | null }) => {
    const variation = variations.find((variation) =>
      variation.attributes.every((attr) => {
        const attrName = attr.value.attribute.name;
        return selectedAttrs[attrName]?.id === attr.value.id;
      })
    );
    return variation || null;
  };

  // Handle attribute selection for variable products
  const handleAttributeChange = (attrName: string, value: AttributeValue) => {
    const newSelectedAttributes = { ...selectedAttributes, [attrName]: value };
    setSelectedAttributes(newSelectedAttributes);
    const variation = findVariationByAttributes(product!.variations, newSelectedAttributes);
    setSelectedVariation(variation);
    setQuantity(1); // Reset quantity when variation changes

    // Slide to the variation image if available
    if (variation && mainSwiper) {
      const imageToShow = variation.image_path || product!.feature_image;
      const index = uniqueImages.findIndex((img) => img === imageToShow);
      if (index !== -1) {
        mainSwiper.slideTo(index);
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxStock = selectedVariation ? selectedVariation.stock : product!.stock;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const handleAddToCart = async () => {
    const eventID = uuidv4();
    const payload = {
      product_id: product!.id,
      quantity,
      product_variation_id: selectedVariation ? selectedVariation.id : null,
      event_id: eventID,
      user_data: {
        client_ip_address: window.location.hostname,
        client_user_agent: navigator.userAgent,
      },
    };

    try {
      setIsAddToCartLoading(true);
      await dispatch(addToCart(payload)).unwrap();
      // 🔹 Client-side Pixel event
      trackAddToCart(product, quantity, selectedVariation, eventID, currentPrice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const payload = {
      product_id: product!.id,
      quantity,
      product_variation_id: selectedVariation ? selectedVariation.id : null,
    };

    try {
      setIsBuyNowLoading(true);
      await dispatch(addToCart(payload)).unwrap();
      router.push("/checkout");
    } catch (error) {
      console.error(error);
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  // Parse gallery images
  const galleryImages = product.gallery_images ? JSON.parse(product.gallery_images) : [];
  const allImages = [
    product.feature_image,
    ...galleryImages,
    ...product.variations.map((v) => v.image_path),
  ];
  const uniqueImages = [...new Set(allImages)].filter(Boolean);

  // Calculate prices with main + variation
  const basePrice = parseFloat(product.price);
  const basePreviousPrice = product.previous_price ? parseFloat(product.previous_price) : 0;
  const variationPrice = selectedVariation ? parseFloat(selectedVariation.price) : 0;
  const currentPrice = basePrice + variationPrice;
  const previousPrice = basePreviousPrice + variationPrice;

  // Calculate discount percentage
  const discountPercentage = previousPrice > 0
    ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .swiper-button-prev,
        .swiper-button-next {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s;
        }
        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        .swiper-button-prev::after,
        .swiper-button-next::after {
          font-size: 16px;
          font-weight: bold;
        }
        .swiper-slide img {
          height: auto;
          width: 100%;
          object-fit: contain;
        }
        .thumbs-swiper .swiper-slide {
          opacity: 0.4;
          cursor: pointer;
        }
        .thumbs-swiper .swiper-slide-thumb-active {
          opacity: 1;
          border: 2px solid #2563eb;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <span className="text-gray-500">Home</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-500 capitalize">{product.category.name.toLowerCase()}</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white h-auto rounded-2xl overflow-hidden">
              <Swiper
                modules={[Navigation, Thumbs, FreeMode]}
                navigation={{
                  prevEl: '.swiper-button-prev',
                  nextEl: '.swiper-button-next',
                }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                spaceBetween={10}
                slidesPerView={1}
                onSwiper={setMainSwiper}
              >
                {uniqueImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full object-contain"
                    />
                  </SwiperSlide>
                ))}
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
              </Swiper>
              {discountPercentage > 0 && (
                <div className="absolute z-10 top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{discountPercentage}%
                </div>
              )}
            </div>
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbs-swiper"
            >
              {uniqueImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-auto object-contain rounded-lg border border-gray-200"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* <pre>{JSON.stringify(selectedVariation, null, 2)}</pre> */}

          {/* Product Information */}
          <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-2">SKU: {product.product_code}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">(4.8) • {product.sold_stock} sold</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                ৳{currentPrice.toFixed(2)}
              </span>
              {product.previous_price && (
                <span className="text-lg text-gray-500 line-through">
                  ৳{previousPrice.toFixed(2)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                  Save {discountPercentage}%
                </span>
              )}
            </div>

            {/* Dynamic Attributes (only for variable products) */}
            {product.variations.length > 0 && (
              <div className="space-y-6">
                {Object.entries(getAttributeGroups(product.variations)).map(([attrName, attrGroup], index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-3">{attrName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {attrGroup.map((item) => {
                        const isSelected = selectedAttributes[attrName]?.id === item.value.id;
                        const isDisabled = item.stock === 0;
                        return (
                          <button
                            key={item.value.id}
                            onClick={() => handleAttributeChange(attrName, item.value)}
                            disabled={isDisabled}
                            className={`px-3 py-1 border-2 rounded-lg text-center font-medium transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : isDisabled
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {item.value.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!selectedVariation && (
                  <div className="text-red-600 text-sm">
                    Please select a valid combination of attributes.
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (selectedVariation?.stock || product.stock)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {selectedVariation?.stock || product.stock} available
                </span>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={
                  isAddToCartLoading ||
                  (product.variations.length > 0 && (!selectedVariation || selectedVariation.stock === 0)) ||
                  (product.variations.length === 0 && product.stock === 0)
                }
                className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2`}
              >
                {isAddToCartLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={
                  isBuyNowLoading ||
                  (product.variations.length > 0 && (!selectedVariation || selectedVariation.stock === 0))
                }
                onClick={handleBuyNow}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isBuyNowLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Buying...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Buy Now</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2">
                {product.is_free_delivery ? (
                  <Truck className="w-5 h-5 text-green-600" />
                ) : (
                  <Truck className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm">
                  {product.is_free_delivery ? 'Free Delivery' : 'Delivery Available'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm">Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Share Product</span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && product.description !== "<p>&nbsp;</p>" && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}