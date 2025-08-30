"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productsSlice";
import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state: any) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="container py-8 mx-auto">
      {loading ? (
        // <p className="text-center text-gray-500">Loading...</p> 
        ""
      ) : error ? (
        // <p className="text-center text-red-500">Error: {error}</p>
        ""
      ) : (
        <div>
          {Object.keys(products).map((category) => (
            <div key={category} className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{category}</h2>
                <div className="flex items-center space-x-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    See All
                  </button>
                  <div className="flex space-x-2">
                    <button
                      className={`swiper-button-prev-${category.replace(/\s/g, '-')}`}
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
                      className={`swiper-button-next-${category.replace(/\s/g, '-')}`}
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
              
              {/* Swiper container with hover group */}
              <div className="group">
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
                    prevEl: `.swiper-button-prev-${category.replace(/\s/g, '-')}`,
                    nextEl: `.swiper-button-next-${category.replace(/\s/g, '-')}`,
                  }}
                  className="mySwiper"
                >
                  {products[category].map((product) => (
                    <SwiperSlide key={product.id} className="product_line_item">
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;