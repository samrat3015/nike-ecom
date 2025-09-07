import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export function useFbPixel() {
  const { facebook_pixel_info = {} } = useSelector(
    (state) => state.settings ?? {}
  );

  const [pixelId, setPixelId] = useState(null);
  const initialized = useRef(false); // ✅ ensures init runs only once

  useEffect(() => {
    if (!facebook_pixel_info.pixel_id || initialized.current) return;

    if (typeof window !== "undefined") {
      if (!window.fbq) {
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = "https://connect.facebook.net/en_US/fbevents.js";
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script");
      }

      if (!window.fbq.initialized) {
        window.fbq("init", facebook_pixel_info.pixel_id);
        window.fbq("track", "PageView");
        window.fbq.initialized = true; // ✅ custom guard
      }

      initialized.current = true;
      setPixelId(facebook_pixel_info.pixel_id);
    }
  }, [facebook_pixel_info]);

  // 🔹 Common track function with queue clearing
  const trackEvent = (event, payload, eventID) => {
    if (typeof window !== "undefined" && window.fbq) {
      // Clear the existing queue to prevent stale events
      window.fbq.queue = [];
      window.fbq(
        "track",
        event,
        payload,
        eventID ? { eventID } : undefined
      );
    }
  };

  // 🔹 User data
  const userData = {
    client_ip_address: typeof window !== "undefined" ? window.location.hostname : "",
    client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };

  // 🔹 Events
  const trackPageView = () => {
    trackEvent("PageView", { user_data: userData });
  };

  const trackViewContent = (product, eventID, currentPrice) => {
    trackEvent(
      "ViewContent",
      {
        content_ids: [product.id.toString()],
        content_type: "product",
        value: currentPrice,
        content_name: product.name,
        content_category: product.category?.name ?? "",
        currency: "BDT",
        user_data: userData,
      },
      eventID
    );
  };

  const trackAddToCart = (product, quantity, selectedVariation, eventID, currentPrice) => {
    const contentVariant = selectedVariation?.attributes
      ?.map((attr) => `${attr.value.attribute.name}: ${attr.value.value}`)
      .join(", ");

    trackEvent(
      "AddToCart",
      {
        content_ids: [product.id.toString()],
        content_type: "product",
        value: currentPrice * quantity,
        content_name: product.name,
        content_category: product.category?.name ?? "",
        currency: "BDT",
        content_variant: contentVariant || "",
        user_data: userData,
        contents: [
          {
            id: product.id.toString(),
            quantity,
            item_price: currentPrice,
          },
        ],
      },
      eventID
    );
  };

  const trackInitiateCheckout = (cartItems, cartTotal, eventID) => {
    trackEvent(
      "InitiateCheckout",
      {
        value: cartTotal,
        currency: "BDT",
        contents: cartItems.map((item) => ({
          id: item.id.toString(),
          name: item?.product_name,
          quantity: item.quantity,
          item_price: item.item_price,
        })),
        user_data: userData,
      },
      eventID
    );
  };

  const trackPurchase = (order, eventID) => {
    // Construct content_variant for each item based on product variation attributes
    const contents = order.items.map((item) => {
      const contentVariant = item.product_variation?.attributes
        ?.map((attr) => `${attr.value.attribute.name}: ${attr.value.value}`)
        .join(", ") || "";

      return {
        id: item.product_id.toString(), // Use product_id instead of item.id for consistency with content_ids
        quantity: item.quantity,
        item_price: parseFloat(item.unit_price), // Use unit_price for individual item price
        content_name: item.product?.name || "", // Product name
        content_category: item.product?.category_id?.toString() || "", // Category ID as a string
        content_variant: contentVariant, // Variation details (e.g., "Color: Red, Size: M")
      };
    });

    // Enhanced user data with customer details from the order
    const enhancedUserData = {
      ...userData,
      em: order.customer_email || "", // Customer email
      ph: order.customer_phone || "", // Customer phone
      fn: order.customer_name ? order.customer_name.split(" ")[0] : "", // First name
      ln: order.customer_name ? order.customer_name.split(" ").slice(1).join(" ") : "", // Last name
    };

    trackEvent(
      "Purchase",
      {
        content_ids: order.items.map((item) => item.product_id.toString()), // Array of product IDs
        content_type: "product", // Standard for product purchases
        value: parseFloat(order.total), // Total order amount
        currency: "BDT", // Currency from order data
        contents: contents, // Detailed item information
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0), // Total quantity of items
        order_id: order.order_number || "", // Unique order number
        shipping_cost: parseFloat(order.shipping_cost) || 0, // Shipping cost
        user_data: enhancedUserData, // Enhanced user data with customer details
      },
      eventID
    );
  };

  return {
    pixelId,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  };
}