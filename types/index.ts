// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id: number | null;
  children?: Category[];
}

// Types for Order and related entities
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_name: string;
  total: string;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_method: string;
  shipping_address: string;
  billing_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product: Product;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string | null;
  images: string[];
}

// Coupon types
export interface CouponSummary {
  total_discount: number;
}

export interface CouponItem {
  cart_item_id: number;
  coupon_code?: string;
  discount_amount?: number;
  discount_type?: string;
  discounted_price?: number;
}

export interface AppliedCouponData {
  summary?: CouponSummary;
  items?: CouponItem[];
  coupon_code?: string;
}

export interface CouponData {
  applied?: AppliedCouponData[];
}

// Add other types as needed
