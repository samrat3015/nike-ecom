"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TopCategory = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    items: categories = [],
    loading: categoriesLoading = false,
    error: categoriesError = null,
  } = useSelector((state) => state.categories ?? {});

  if (!mounted) {
    // Prevent hydration mismatch
    return null;
  }

  const parentCategories = categories.filter((category) => category.parent_id === null);

  return (
    <div className="top-category container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Top Categories</h2>
      {categoriesLoading && <p className="text-center">Loading...</p>}
      {categoriesError && <p className="text-center text-red-500">{categoriesError}</p>}
      {!categoriesLoading && !categoriesError && parentCategories.length === 0 && (
        <p className="text-center">No parent categories found.</p>
      )}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="mySwiper"
      >
        {parentCategories.map((category) => (
          <SwiperSlide key={category.id}>
            <Link href={`/products?category_slug=${category.slug}`}>
              <div className="border rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-image.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TopCategory;
