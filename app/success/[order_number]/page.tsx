// app/success/[order_number]/page.tsx
import React from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface OrderItem {
  id: number;
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
        value: string;
        attribute: { name: string };
      };
    }[];
  };
}

interface Order {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: string;
  status: string;
  items: OrderItem[];
}

export default async function Success({
  params,
}: {
  params: { order_number: string };
}) {
  const res = await fetch(
    `${apiBaseUrl}/order-data/${params.order_number}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="p-6 text-red-500">
        Failed to load order details.
      </div>
    );
  }

  const order: Order = await res.json();

  return (
    <div className="max-w-4xl min-h-[50vh] items-center flex justify-center mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-green-100">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-3xl">✔</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Order Confirmed 🎉
        </h1>
        <p className="text-gray-600">
          Thank you <strong>{order.customer_name}</strong>, your order has been
          placed successfully.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Order Number: <span className="font-mono">{order.order_number}</span>
        </p>
      </div>

      {/* Order Summary */}
      {/* <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          🧾 Order Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><span className="font-medium">Customer:</span> {order.customer_name}</p>
          <p><span className="font-medium">Email:</span> {order.customer_email}</p>
          <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{order.status}</span>
          </p>
          <p className="col-span-2">
            <span className="font-medium">Total Paid:</span>{" "}
            <span className="text-green-600 font-bold">{order.total} ৳</span>
          </p>
        </div>
      </div> */}

      {/* Items */}
      {/* <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🛍 Items</h2>
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center py-4"
            >
              <img
                src={item.product.feature_image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × {item.unit_price} ৳
                </p>
                <p className="text-sm text-gray-400">
                  {item?.product_variation?.attributes.map((attr, i) => (
                    <span key={i}>
                      {attr.value.attribute.name}: {attr.value.value}
                    </span>
                  ))}
                </p>
              </div>
              <p className="font-medium text-gray-700">
                {item.subtotal} ৳
              </p>
            </li>
          ))}
        </ul>
      </div> */}

    </div>
  );
}
