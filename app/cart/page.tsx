"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeFromCart, updateCartQuantity } from "@/store/slices/cartSlice";
import CartSkeleton from "@/components/Skeletons/CartSkeleton";
import Link from "next/link";

export default function Cart() {
  const dispatch = useDispatch();
  const { items: cartItems, loading } = useSelector((state: any) => state.cart);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    dispatch(fetchCart());
  }, [dispatch]);

  // ✅ Add safety check - ensure cartItems is an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Calculate total price
  const subtotal = safeCartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
  const total = subtotal;

  const handleRemoveFromCart = (itemId: number) => {
    dispatch(removeFromCart(itemId));
  };

  const handleUpdateCartQuantity = (itemId: number, quantity: number) => {
    dispatch(updateCartQuantity({ item_id: itemId, quantity }));
  };

  // Show skeleton while loading or during SSR
  if (!isClient || loading) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bag</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            {safeCartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some items to your cart to get started.</p>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              safeCartItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="sm:w-32 w-[100px] bg-gray-200 rounded-md overflow-hidden group">
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.product_name}</h2>
                      
                      <div className="mt-4 flex flex-wrap gap-6">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Price:</span>
                          <span className="font-medium text-blue-600">TK. {parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Quantity:</span>
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button onClick={() => handleUpdateCartQuantity(item.id, -1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                              </svg>
                            </button>
                            <span className="px-4 py-2 border-x bg-gray-50 min-w-[3rem] text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateCartQuantity(item.id, 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          TK. {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({safeCartItems.length} {safeCartItems.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">TK. {subtotal.toFixed(2)}</span>
                </div>
                
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">TK. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link href="/checkout" className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                  Proceed to Checkout
                </Link>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Free shipping on orders over TK. 2000
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  30-day easy returns
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}