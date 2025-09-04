import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

let isPixelInitialized = false; // ensures fbq loads only once

export function useFbPixel() {
  const { facebook_pixel_info = {} } = useSelector(
    (state) => state.settings ?? {}
  );

  const [pixelId, setPixelId] = useState(null);

  useEffect(() => {
    if (!facebook_pixel_info.pixel_id) return;

    setPixelId(facebook_pixel_info.pixel_id);

    // Initialize fbq only once
    if (!isPixelInitialized && typeof window !== "undefined") {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
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

      window.fbq("init", facebook_pixel_info.pixel_id);
      window.fbq("track", "PageView");

      isPixelInitialized = true;
    }
  }, [facebook_pixel_info]);

  const trackEvent = (event, payload, eventID) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", event, payload, eventID ? { eventID } : undefined);
    }
  };

  // Common user_data
  const userData = {
    client_ip_address: window?.location?.hostname || "",
    client_user_agent: navigator?.userAgent || "",
  };

  const trackPageView = () => {
    trackEvent("PageView", { user_data: userData });
  };

  const trackViewContent = (product, eventID, currentPrice) => {
    trackEvent("ViewContent", {
      content_ids: [product.id.toString()],
      content_type: "product",
      value: currentPrice,
      content_name: product.name,
      content_category: product.category.name,
      currency: "BDT",
      user_data: userData,
    }, eventID);
  };

  const trackAddToCart = (product, quantity, selectedVariation, eventID, currentPrice) => {
    const contentVariant = selectedVariation?.attributes
      ?.map(attr => `${attr.value.attribute.name}: ${attr.value.value}`)
      .join(", ");

    trackEvent("AddToCart", {
      content_ids: [product.id.toString()],
      content_type: "product",
      value: currentPrice * quantity,
      content_name: product.name,
      content_category: product.category.name,
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
    }, eventID);
  };

  const trackInitiateCheckout = (cartItems, eventID) => {
    trackEvent("InitiateCheckout", {
      value: cartItems.reduce((sum, item) => sum + item.item_price * item.quantity, 0),
      currency: "BDT",
      contents: cartItems.map(item => ({
        id: item.id.toString(),
        quantity: item.quantity,
        item_price: item.item_price,
      })),
      user_data: userData,
    }, eventID);
  };

  const trackPurchase = (order, eventID) => {
    trackEvent("Purchase", {
      value: order.total_amount,
      currency: "BDT",
      contents: order.items.map(item => ({
        id: item.id.toString(),
        quantity: item.quantity,
        item_price: item.item_price,
      })),
      user_data: userData,
    }, eventID);
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
