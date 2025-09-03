"use client";

import React from "react";

const SliderPreloader = () => {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        {/* Fake slide image */}
        <div className="w-full h-[400px] md:h-[600px] bg-gray-200 animate-pulse"></div>

        {/* Fake arrows */}
        <div className="absolute top-1/2 left-4 w-12 h-12 bg-gray-300 animate-pulse rounded-full"></div>
        <div className="absolute top-1/2 right-4 w-12 h-12 bg-gray-300 animate-pulse rounded-full"></div>
      </div>

      {/* Fake pagination bullets */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-3 h-3 bg-gray-300 animate-pulse rounded-full"></div>
        <div className="w-3 h-3 bg-gray-300 animate-pulse rounded-full"></div>
        <div className="w-3 h-3 bg-gray-300 animate-pulse rounded-full"></div>
      </div>
    </div>
  );
};

export default SliderPreloader;
