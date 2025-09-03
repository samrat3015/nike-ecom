'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { initializeAuth, logout } from '@/store/slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
    product: {
      name: string;
      feature_image: string;
    };
    product_variation: {
      attributes: {
        value: {
          attribute: { name: string };
          value: string;
        }[];
      };
    };
  }[];
}

interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function DashboardPage() {
  const { isAuthenticated, initialized, authLoading, user, access_token } = useSelector(
    (state: any) => state.auth ?? {}
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    next_page_url: null,
    prev_page_url: null,
  });

  const fetchOrders = useCallback(
    async (page: number = 1) => {
      if (!isAuthenticated || !user?.id || !access_token) return;

      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/ordersbyuser/${user.id}?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.data);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          next_page_url: data.next_page_url,
          prev_page_url: data.prev_page_url,
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setOrdersLoading(false);
      }
    },
    [isAuthenticated, user?.id, access_token]
  );

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
    }
  }, [initialized, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.id && access_token) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, user?.id, access_token, currentPage, fetchOrders, dispatch]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg md:text-xl text-gray-700 font-medium bg-white p-6 rounded-lg shadow-lg">
          Please log in to view your dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
          Your Dashboard
        </h1>

        <div className="user-info bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h2>
              <p className="text-gray-600 mt-2">Email: <span className="font-medium">{user?.email}</span></p>
              <p className="text-gray-600">Phone: <span className="font-medium">{user?.phone_number}</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="orders-section">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Your Orders</h2>

          {ordersLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600"></div>
            </div>
          )}

          {ordersError && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 rounded-lg mb-6">
              <p>Error: {ordersError}</p>
            </div>
          )}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-600">
              You haven't placed any orders yet.
            </div>
          )}

          {!ordersLoading && !ordersError && orders.length > 0 && (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                    Order #{order.order_number}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-2">
                        Status: <span className="font-semibold text-indigo-600">{order.status}</span>
                      </p>
                      <p className="text-gray-600 mb-2">
                        Total: <span className="font-semibold">TK {order.total}</span>
                      </p>
                      <p className="text-gray-600 mb-2">
                        Date: <span className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
                      </p>
                      <p className="text-gray-600">
                        Shipping Address: <span className="font-semibold">{order.shipping_address}</span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Items:</h4>
                      <ul className="space-y-4">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-start gap-4">
                            {item.product.feature_image && (
                              <img
                                src={item.product.feature_image}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Unit Price: TK {item.unit_price}</p>
                              {item?.product_variation?.attributes && (
                                <p className="text-sm text-gray-600">
                                  Attributes:{' '}
                                  {item.product_variation.attributes
                                    .map((attr) => `${attr.value.attribute.name}: ${attr.value.value}`)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!ordersLoading && !ordersError && orders.length > 0 && (
            <div className="pagination mt-8 flex justify-center items-center space-x-2 flex-wrap gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.prev_page_url}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                Previous
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.next_page_url}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}