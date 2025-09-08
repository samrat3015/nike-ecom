"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productsSlice";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "@/components/Skeletons/ProductCardSkeleton";
import { AppDispatch, RootState } from "@/store";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import Link from "next/link";

export interface Product {
  id: number;
  name: string;
  slug: string;
  feature_image: string;
  price: string | number;
  previous_price?: string | number;
  category?: { slug?: string; name?: string };
  [key: string]: any;
}

interface CategoryProducts {
  [key: string]: Product[];
}

const HomeProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // console.log("Products state:", products);
  // console.log("Loading:", loading, "Error:", error);

  return (
    <div className="container py-8 mx-auto">
      {error && (
        <div className="text-red-500 text-center">
          Error: {error}
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      {loading ? (
        <div>
          {["Category 1", "Category 2"].map((categoryKey) => (
            <div key={categoryKey} className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <Swiper
                modules={[Navigation, Scrollbar]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  0: { slidesPerView: 2 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                navigation={{
                  prevEl: `.swiper-button-prev-${categoryKey.replace(/\s/g, "-")}`,
                  nextEl: `.swiper-button-next-${categoryKey.replace(/\s/g, "-")}`,
                }}
                className="mySwiper"
              >
                {[...Array(3)].map((_, index) => (
                  <SwiperSlide key={index} className="product_line_item">
                    <ProductCardSkeleton />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {Object.keys(products).map((categoryKey) => {
            const categoryProducts = products[categoryKey];
            const firstProduct = categoryProducts?.[0];
            const categorySlug = firstProduct?.category?.slug;
            return (
              <div key={categoryKey} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="md:text-xl text-base font-semibold">{categoryKey}</h2>
                  <div className="flex items-center space-x-4">
                    {categorySlug && (
                      <Link
                        href={`/products?category_slug=${categorySlug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
                      >
                        See All
                      </Link>
                    )}
                    <div className="flex space-x-2">
                      <button
                        className={`swiper-button-prev-${categoryKey.replace(/\s/g, "-")}`}
                        aria-label="Previous slide"
                      >
                        <svg
                          className="w-6 h-6 text-gray-600 hover:text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        className={`swiper-button-next-${categoryKey.replace(/\s/g, "-")}`}
                        aria-label="Next slide"
                      >
                        <svg
                          className="w-6 h-6 text-gray-600 hover:text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <Swiper
                  modules={[Navigation, Scrollbar]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    0: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  navigation={{
                    prevEl: `.swiper-button-prev-${categoryKey.replace(/\s/g, "-")}`,
                    nextEl: `.swiper-button-next-${categoryKey.replace(/\s/g, "-")}`,
                  }}
                  className="mySwiper"
                >
                  {categoryProducts.map((product: Product) => (
                    <SwiperSlide key={product.id} className="product_line_item">
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeProducts;