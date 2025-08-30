// components/skeletons/CartSkeleton.tsx
import React from 'react';

const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title Skeleton */}
        <div className="h-9 bg-gray-300 rounded-md w-24 mb-8 animate-pulse"></div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:w-2/3 space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image Skeleton */}
                  <div className="sm:w-32 h-32 bg-gray-300 rounded-md animate-pulse"></div>
                  
                  {/* Product Details Skeleton */}
                  <div className="flex-1 space-y-4">
                    {/* Product Name */}
                    <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                    
                    {/* Price and Quantity Row */}
                    <div className="flex flex-wrap gap-4">
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* Bottom Row - Total and Remove */}
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary Skeleton */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Summary Title */}
              <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
              
              {/* Summary Items */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-300 rounded w-12 animate-pulse"></div>
                    <div className="h-5 bg-gray-300 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="space-y-4 mt-8">
                <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
              </div>
              
              {/* Additional Info */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;