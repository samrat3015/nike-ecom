"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export function useFbPixel() {
  const { facebook_pixel_info = {} } = useSelector((state) => state.settings ?? {})
  const [pixelId, setPixelId] = useState(null)
  const initialized = useRef(false)
  const eventQueue = useRef(new Map()) // Use Map to track events with timestamps
  const lastEventTime = useRef(new Map()) // Track last event time per event type

  useEffect(() => {
    if (!facebook_pixel_info.pixel_id || initialized.current) return

    if (typeof window !== "undefined") {
      if (!window.fbq) {
        !((f, b, e, v, n, t, s) => {
          if (f.fbq) return
          n = f.fbq = () => {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          }
          if (!f._fbq) f._fbq = n
          n.push = n
          n.loaded = !0
          n.version = "2.0"
          n.queue = []
          t = b.createElement(e)
          t.async = !0
          t.src = "https://connect.facebook.net/en_US/fbevents.js"
          s = b.getElementsByTagName(e)[0]
          s.parentNode.insertBefore(t, s)
        })(window, document, "script")
      }

      if (!window.fbq.initialized) {
        window.fbq("init", facebook_pixel_info.pixel_id)
        window.fbq("track", "PageView")
        window.fbq.initialized = true
      }

      initialized.current = true
      setPixelId(facebook_pixel_info.pixel_id)
    }
  }, [facebook_pixel_info])

  const userData = {
    client_ip_address: typeof window !== "undefined" ? window.location.hostname : "",
    client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  }

  const trackEvent = useCallback(async (event, payload) => {
    const now = Date.now()

    const eventKey = `${event}-${JSON.stringify({
      content_ids: payload.content_ids,
      value: payload.value,
      content_name: payload.content_name,
    })}`

    const lastTime = lastEventTime.current.get(eventKey)
    if (lastTime && now - lastTime < 2000) {
      console.log(`Preventing duplicate ${event} event`)
      return
    }

    lastEventTime.current.set(eventKey, now)

    if (lastEventTime.current.size > 50) {
      const cutoff = now - 10000
      for (const [key, time] of lastEventTime.current.entries()) {
        if (time < cutoff) {
          lastEventTime.current.delete(key)
        }
      }
    }

    const eventID = uuidv4()

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", event, payload, { eventID })
    }

    try {
      await axios.post(`${apiBaseUrl}/pixel/track`, {
        event_name: event,
        event_id: eventID,
        payload: payload,
      })
    } catch (err) {
      console.error("Pixel backend error", err)
      lastEventTime.current.delete(eventKey)
    }
  }, [])

  const trackPageView = useCallback(() => trackEvent("PageView", { user_data: userData }), [trackEvent])

  const trackViewContent = useCallback(
    (product, price) =>
      trackEvent("ViewContent", {
        content_ids: [product.id.toString()],
        content_type: "product",
        value: price,
        content_name: product.name,
        content_category: product.category?.name ?? "",
        currency: "BDT",
        user_data: userData,
      }),
    [trackEvent],
  )

  const trackAddToCart = useCallback(
    (product, quantity, selectedVariation, price) => {
      const contentVariant = selectedVariation?.attributes
        ?.map((attr) => `${attr.value.attribute.name}: ${attr.value.value}`)
        .join(", ")

      trackEvent("AddToCart", {
        content_ids: [product.id.toString()],
        content_type: "product",
        value: price * quantity,
        content_name: product.name,
        content_category: product.category?.name ?? "",
        currency: "BDT",
        content_variant: contentVariant || "",
        user_data: userData,
        contents: [
          {
            id: product.id.toString(),
            quantity,
            item_price: price,
          },
        ],
      })
    },
    [trackEvent],
  )

  const trackInitiateCheckout = useCallback(
    (cartItems, cartTotal) =>
      trackEvent("InitiateCheckout", {
        value: cartTotal,
        currency: "BDT",
        contents: cartItems.map((item) => ({
          id: item.id.toString(),
          name: item.product_name,
          quantity: item.quantity,
          item_price: item.item_price,
        })),
        user_data: userData,
      }),
    [trackEvent],
  )

  const trackPurchase = useCallback(
    (order) => {
      const contents = order.items.map((item) => {
        const contentVariant =
          item.product_variation?.attributes
            ?.map((attr) => `${attr.value.attribute.name}: ${attr.value.value}`)
            .join(", ") || ""

        return {
          id: item.product_id.toString(),
          quantity: item.quantity,
          item_price: Number.parseFloat(item.unit_price),
          content_name: item.product?.name || "",
          content_category: item.product?.category_id?.toString() || "",
          content_variant: contentVariant,
        }
      })

      const enhancedUserData = {
        ...userData,
        em: order.customer_email || "",
        ph: order.customer_phone || "",
        fn: order.customer_name?.split(" ")[0] || "",
        ln: order.customer_name?.split(" ").slice(1).join(" ") || "",
      }

      trackEvent("Purchase", {
        content_ids: order.items.map((item) => item.product_id.toString()),
        content_type: "product",
        value: Number.parseFloat(order.total),
        currency: "BDT",
        contents: contents,
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        order_id: order.order_number || "",
        shipping_cost: Number.parseFloat(order.shipping_cost) || 0,
        user_data: enhancedUserData,
      })
    },
    [trackEvent],
  )

  return {
    pixelId,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
  }
}
