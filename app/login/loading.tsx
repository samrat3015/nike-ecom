// app/loading.tsx
"use client"; // needed if you use state or effects

import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md animate-pulse">
        {/* Title */}
        <div className="h-8 bg-gray-300 rounded mb-6"></div>

        {/* Email input placeholder */}
        <div className="h-12 bg-gray-300 rounded mb-4"></div>

        {/* Password input placeholder */}
        <div className="h-12 bg-gray-300 rounded mb-6"></div>

        {/* Button placeholder */}
        <div className="h-12 bg-blue-500 rounded"></div>
      </div>
    </div>
  );
}
