"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CouponSidebar({ isOpen, onClose, cartTotal, cartId, onCouponApplied }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/couponList`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status === "success") {
        setCoupons(data.data);
      } else {
        toast.error("Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (coupon) => {
    try {
      const payload = {
        code: coupon.code,
        cart_ids: [cartId]
      };

      const response = await fetch(`${apiBaseUrl}/apply-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Coupon applied successfully");
        onCouponApplied(data);
        onClose();
      } else {
        toast.error("Failed to apply coupon");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Error applying coupon");
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Available Coupons</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center text-gray-600">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="text-center text-gray-600">No coupons available</div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => {
                  const isValid = parseFloat(cartTotal) >= parseFloat(coupon.minimum_order_amount);
                  const isExpired = new Date(coupon.expiry_date) < new Date();
                  const isMaxUsed = coupon.uses_count >= coupon.max_uses;

                  return (
                    <div
                      key={coupon.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <h3 className="font-medium text-gray-900">{coupon.name}</h3>
                      <p className="text-sm text-gray-600">Code: {coupon.code}</p>
                      <p className="text-sm text-gray-600">
                        Discount: {coupon.discount_type === "percentage" 
                          ? `${coupon.discount_value}%` 
                          : `৳${coupon.discount_value}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Min Order: ৳{coupon.minimum_order_amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={!isValid || isExpired || isMaxUsed}
                        className={`w-full mt-2 py-2 rounded-md text-white font-medium transition duration-200
                          ${!isValid || isExpired || isMaxUsed 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {isExpired ? 'Expired' : isMaxUsed ? 'Max Uses Reached' : 'Apply Coupon'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}