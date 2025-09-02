"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlider } from "@/store/slices/settingsSlice";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Slider = () => {
  const dispatch = useDispatch();

  const { slider, sliderLoading, sliderError } = useSelector(
    (state: any) => state.settings
  );

  useEffect(() => {
    dispatch(fetchSlider());
  }, [dispatch]);

  return (
    <div>
      <section>
        {sliderLoading && "" }
        {sliderError && ""}

        {slider && slider.length > 0 ? (
          <div className="slider-container">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={true}
              pagination={{ 
                clickable: true,
                dynamicBullets: true 
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              effect="fade"
              fadeEffect={{
                crossFade: true
              }}
              loop={true}
              className="w-full h-auto lg:h-[90vh]"
            >
              {slider.map((item: any) => (
                <SwiperSlide key={item.id}>
                  <div className="relative w-full h-full">
                    <img
                      src={item.image}
                      alt={item.title || "slider"}
                      className="object-cover"
                    />
                    {/* Optional overlay with content */}
                    {(item.title || item.description) && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white px-4">
                          {item.title && (
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
                              {item.title}
                            </h2>
                          )}
                          {item.description && (
                            <p className="text-sm md:text-lg lg:text-xl max-w-2xl">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          !sliderLoading && <p>No slider available</p>
        )}
      </section>

      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.5);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          margin-top: -20px !important;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 16px !important;
          font-weight: bold;
        }

        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }

        .swiper-pagination-bullet-active {
          background: white !important;
        }

        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Slider;