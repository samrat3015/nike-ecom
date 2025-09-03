import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="card bg-base-100 animate-pulse">
      {/* Image placeholder */}
      <div className="card-image relative aspect-square overflow-hidden">
        <div className="w-full h-full bg-gray-200" />
      </div>
      {/* Card body placeholder */}
      <div className="card-body pt-3">
        {/* Title placeholder */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        {/* Price placeholder */}
        <div className="price_area text-[12px] sm:text-base pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;