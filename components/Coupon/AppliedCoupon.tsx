"use client";
import React from "react";

export default function AppliedCoupon({ couponData }) {
  if (!couponData || !couponData.applied || couponData.applied.length === 0) {
    return null;
  }

  const { coupon_code, discount_type, discount_amount } = couponData.applied[0].items[0];

  return (
    <div className="border-t pt-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700">Applied Coupon</h3>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Coupon: {coupon_code} ({discount_type === "percentage" 
            ? `${discount_amount}%` 
            : `৳${discount_amount}`})
        </span>
      </div>
    </div>
  );
}