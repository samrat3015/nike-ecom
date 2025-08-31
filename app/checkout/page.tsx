"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeFromCart, updateCartQuantity } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { fetchSettings } from "@/store/slices/settingsSlice";
import CouponSidebar from "@/components/Coupon/CouponSidebar";
import AppliedCoupon from "@/components/Coupon/AppliedCoupon";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Checkout() {
  const dispatch = useDispatch();
  const { items: cartItems, total: cartTotal, cartId, loading } = useSelector((state) => state.cart);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { settings, loading: settingsLoading, error: settingsError } = useSelector((state) => state.settings ?? {});
  const [isCouponSidebarOpen, setIsCouponSidebarOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [area, setArea] = useState("inside_dhaka");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    dispatch(fetchCart());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Calculate totals
  const subtotal = Number(cartTotal);
  const shippingCost =
    area === "inside_dhaka"
      ? Number(settings?.shipping_charge_inside_dhaka || 0)
      : Number(settings?.shipping_charge_outside_dhaka || 0);
  const totalDiscount = appliedCoupon?.applied[0]?.summary?.total_discount || 0;
  const total = subtotal + shippingCost - totalDiscount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      shipping_cost: shippingCost,
      area: area,
      payment_method: paymentMethod,
      items: cartItems.map(item => {
        const couponItem = appliedCoupon?.applied[0]?.items.find(cartItem => cartItem.cart_item_id === item.id);
        return {
          product_id: item.product_id,
          product_variation_id: item.variation_id,
          quantity: item.quantity,
          coupon_code: couponItem?.coupon_code || null,
          discount_amount: couponItem?.discount_amount || null,
          discount_type: couponItem?.discount_type || null,
          discounted_price: couponItem?.discounted_price || null
        };
      })
    };

    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setIsLoading(false);
        toast.success("Order submitted successfully");
        await dispatch(fetchCart());
        const data = await response.json();
        router.push('/success/' + data.order_number);
        return data;
      } else {
        toast.error("Order failed");
        console.error("Order failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Error submitting order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
    setIsCouponSidebarOpen(false);
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          {/* Left column - Customer Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Customer Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Area *
                  </label>
                  <select
                    id="area"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inside_dhaka">Inside Dhaka</option>
                    <option value="outside_dhaka">Outside Dhaka</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Shipping Address</h2>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <textarea
                  id="address"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your complete shipping address"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment Method</h2>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="online"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="online" className="ml-3 block text-sm font-medium text-gray-700">
                    Online Payment
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>

              {cartItems.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
              ) : (
                <>
                  <div className="divide-y mb-4 max-h-80 overflow-y-auto">
                    {cartItems.map((item) => {
                      const couponItem = appliedCoupon?.applied[0]?.items.find(cartItem => cartItem.cart_item_id === item.id);
                      return (
                        <div key={item.id} className="py-4 flex">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="ml-3 flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{item.product_name}</h3>

                            {item.variation_attributes && (
                              <div className="mt-1 text-xs text-gray-600">
                                {item.variation_attributes.map((attr, index) => (
                                  <span key={index}>
                                    {attr.name}: {attr.value}
                                    {index < item.variation_attributes.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-1 flex justify-between items-center">
                              <div className="text-gray-900 font-medium text-sm">
                                ৳{couponItem?.discounted_price || item.price}
                              </div>
                              <div className="text-gray-600 text-sm">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <AppliedCoupon couponData={appliedCoupon} />

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">৳{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">৳{shippingCost.toFixed(2)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coupon Discount:</span>
                        <span className="text-green-600">-৳{totalDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">৳{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCouponSidebarOpen(true)}
                    className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition duration-200 font-medium"
                  >
                    Apply Coupon
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      <CouponSidebar
        isOpen={isCouponSidebarOpen}
        onClose={() => setIsCouponSidebarOpen(false)}
        cartTotal={cartTotal}
        cartId={cartId}
        onCouponApplied={handleCouponApplied}
      />
    </div>
  );
}