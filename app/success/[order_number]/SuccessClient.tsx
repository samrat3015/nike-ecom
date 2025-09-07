"use client";

import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Order } from "@/types";
import { useFbPixel } from "@/hooks/useFbPixel";

interface Props {
  order: Order;
}

export function SuccessClient({ order }: Props) {
  const { trackPurchase } = useFbPixel();
  const hasTracked = useRef(false);
  const eventID = uuidv4();

  useEffect(() => {
    const trackedOrders = JSON.parse(
      localStorage.getItem("trackedOrders") || "[]"
    );

    if (trackedOrders.includes(order.order_number)) return;

    if (!hasTracked.current) {
      trackPurchase(order, eventID);
      hasTracked.current = true;
      trackedOrders.push(order.order_number);
      localStorage.setItem("trackedOrders", JSON.stringify(trackedOrders));
    }

    return () => {
      hasTracked.current = false;
    };
  }, [order.order_number, trackPurchase, eventID]);

  return (
    <div className="max-w-4xl min-h-[50vh] flex items-center justify-center mx-auto p-6">
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
    </div>
  );
}
