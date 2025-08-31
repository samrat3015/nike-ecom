"use client";
import React from "react";

export default function AppliedCoupon({ couponData }) {
  if (!couponData || !couponData.applied || couponData.applied.length === 0) {
    return null;
  }

  const { coupon_code } = couponData.applied[0];
  const appliedCoupon = couponData.applied[0];

  // Default values
  let discount_amount = null;
  let discount_type = null;

  const matchedItem = appliedCoupon.items.find(
    (item) =>
      item.discount_amount !== undefined && item.discount_type !== undefined
  );

  if (matchedItem) {
    discount_amount = matchedItem.discount_amount;
    discount_type = matchedItem.discount_type;
  }

  return (
    <div className="border-t pt-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700">Applied Coupon</h3>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Coupon: {coupon_code}{" "}
          ({discount_type === "percentage"
            ? `${discount_amount}%`
            : discount_amount !== null
            ? `৳${discount_amount}`
            : ""})
        </span>
      </div>
    </div>
  );
}
