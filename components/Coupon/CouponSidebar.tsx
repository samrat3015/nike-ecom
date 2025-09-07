"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { X, Tag, Calendar, ShoppingCart, Percent, DollarSign, Gift } from "lucide-react";
import { CouponData } from "@/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Coupon {
  id: number;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order_amount: number | null;
  expiry_date: string;
  uses_count: number;
  max_uses: number;
}

interface CouponSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  cartId: number | null;
  onCouponApplied: (coupon: CouponData) => void;
}

export default function CouponSidebar({ isOpen, onClose, cartTotal, cartId, onCouponApplied }: CouponSidebarProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/couponList/${cartId}`, {
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

  const handleApplyCoupon = async (coupon: Coupon) => {
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
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    },
    closed: {
      x: "100%",
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return (
        <div className="flex items-center space-x-1 text-emerald-600">
          <span className="text-xl font-bold">{coupon.discount_value}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-emerald-600">
          <span className="text-xl font-bold">৳{coupon.discount_value}</span>
        </div>
      );
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const minOrder = coupon.minimum_order_amount;
    const isValid = !minOrder || cartTotal >= minOrder;
    const isExpired = new Date(coupon.expiry_date) < new Date();
    const isMaxUsed = coupon.uses_count >= coupon.max_uses;

    if (isExpired) return { status: 'expired', text: 'Expired', color: 'bg-red-500' };
    if (isMaxUsed) return { status: 'maxUsed', text: 'Max Uses Reached', color: 'bg-gray-500' };
    if (!isValid) return { status: 'invalid', text: `Min Order ৳${minOrder}`, color: 'bg-orange-500' };
    return { status: 'valid', text: 'Apply Coupon', color: 'bg-gradient-to-r from-blue-600 to-purple-600' };
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
            className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-gray-50 to-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Gift className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Available Offers</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"
                  />
                  <p className="text-gray-600 mt-4">Loading amazing offers...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-center">No coupons available at the moment</p>
                  <p className="text-sm text-gray-500 text-center mt-2">Check back later for exciting offers!</p>
                </div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {coupons.map((coupon, index) => {
                    const statusInfo = getCouponStatus(coupon);
                    const isDisabled = statusInfo.status !== 'valid';

                    return (
                      <motion.div
                        key={coupon.id}
                        variants={cardVariants}
                        whileHover={!isDisabled ? "hover" : {}}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-50/50' 
                            : 'border-transparent bg-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {/* Gradient Border Effect */}
                        {!isDisabled && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-xl" />
                        )}
                        
                        <div className={`relative m-0.5 rounded-lg p-5 ${isDisabled ? 'bg-gray-50' : 'bg-white'}`}>
                          {/* Header with discount */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg leading-tight ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                {coupon.name}
                              </h3>
                            </div>
                            <div className={`flex-shrink-0 ml-3 ${isDisabled ? 'opacity-50' : ''}`}>
                              {getDiscountDisplay(coupon)}
                            </div>
                          </div>

                          {/* Coupon Code */}
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-dashed mb-4 ${
                            isDisabled ? 'bg-gray-100 border-gray-300' : 'bg-purple-50 border-purple-300'
                          }`}>
                            <Tag className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-purple-600'}`} />
                            <code className={`font-mono font-bold text-sm ${isDisabled ? 'text-gray-500' : 'text-purple-800'}`}>
                              {coupon.code}
                            </code>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 mb-4">
                            {coupon.minimum_order_amount && (
                              <div className="flex items-center space-x-2 text-sm">
                                <ShoppingCart className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={isDisabled ? 'text-gray-500' : 'text-gray-700'}>
                                  Min Order: <span className="font-semibold">৳{coupon.minimum_order_amount}</span>
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
                              <span className={isDisabled ? 'text-gray-500' : 'text-gray-700'}>
                                Valid until: <span className="font-semibold">
                                  {new Date(coupon.expiry_date).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          {statusInfo.status !== 'valid' && (
                            <div className="mb-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          )}

                          {/* Action Button */}
                          <motion.button
                            onClick={() => handleApplyCoupon(coupon)}
                            disabled={isDisabled}
                            whileHover={!isDisabled ? { scale: 1.02 } : {}}
                            whileTap={!isDisabled ? { scale: 0.98 } : {}}
                            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                              isDisabled 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : `${statusInfo.color} text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5`
                            }`}
                          >
                            {statusInfo.text}
                          </motion.button>

                          {/* Decorative Elements */}
                          {!isDisabled && (
                            <>
                              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-bl-3xl" />
                              <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-tr-2xl" />
                            </>
                          )}

                          {/* Savings Highlight */}
                          {!isDisabled && coupon.discount_type === "percentage" && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              SAVE UP TO ৳{Math.round(cartTotal * (coupon.discount_value / 100))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Footer */}
              {coupons.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    🎉 More exclusive offers coming soon! Keep shopping to unlock better deals.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}