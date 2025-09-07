import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSessionId } from "@/utils/session";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// --------------------
// Types
// --------------------
export interface CartItem {
  id: number;
  product_name: string;
  product_image: string;
  price: string | number;
  quantity: number;
  product_id?: number;
  variation_id?: number;
  variation_attributes?: Array<{
    name: string;
    value: string;
  }>;
}

interface CartState {
  cartId: number | null;
  items: CartItem[];
  total: number;
  items_count: number;
  loading: boolean;
  error: string | null;
}

interface UpdateCartQuantityPayload {
  item_id: number | string;
  quantity: number;
}

interface AddToCartPayload {
  product_id: number | string;
  quantity: number;
}

interface RemoveFromCartPayload {
  item_id: number | string;
}

// --------------------
// Helper
// --------------------
const getCartIdentifier = (getState: any) => {
  const state = getState();
  const user = state.auth?.user;
  if (user && user.id) return { user_id: user.id };
  return { session_id: getSessionId() };
};

// --------------------
// Async Thunks
// --------------------

// Add to Cart
export const addToCart = createAsyncThunk<
  any,
  AddToCartPayload,
  { state: any }
>("cart/addToCart", async (payload, thunkAPI) => {
  const identifier = getCartIdentifier(thunkAPI.getState);
  const data = { ...payload, ...identifier };

  try {
    const res = await fetch(`${apiBaseUrl}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      toast.error(result.message || "Failed to add to cart");
      throw new Error(result.message || "Failed to add to cart");
    } else {
      toast.success(result.message);
      await thunkAPI.dispatch(fetchCart());
    }

    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Remove from Cart
export const removeFromCart = createAsyncThunk<
  any,
  RemoveFromCartPayload,
  { state: any }
>("cart/removeFromCart", async (payload, thunkAPI) => {
  const identifier = getCartIdentifier(thunkAPI.getState);
  const data = { ...payload, ...identifier };

  try {
    const res = await fetch(`${apiBaseUrl}/cart/cartitem/destroy`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to remove from cart");
      throw new Error(result.message || "Failed to remove from cart");
    } else {
      toast.success(result.message || "Item removed from cart");
      await thunkAPI.dispatch(fetchCart());
    }

    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Update Cart Quantity
export const updateCartQuantity = createAsyncThunk<
  any,
  UpdateCartQuantityPayload,
  { state: any }
>("cart/updateCartQuantity", async (data, thunkAPI) => {
  const identifier = getCartIdentifier(thunkAPI.getState);
  const payload = { ...data, ...identifier };

  try {
    const res = await fetch(`${apiBaseUrl}/cart/update-quantity`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to update cart quantity");
      throw new Error(result.message || "Failed to update cart quantity");
    } else {
      toast.success(result.message || "Cart updated");
      await thunkAPI.dispatch(fetchCart());
    }

    return result;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Fetch Cart
export const fetchCart = createAsyncThunk<any, void, { state: any }>(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const user = state.auth?.user;

      let url: string;
      if (user && user.id) {
        url = `${apiBaseUrl}/cart?user_id=${user.id}`;
      } else {
        url = `${apiBaseUrl}/cart?session_id=${getSessionId()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cart");

      const result = await res.json();
      return result;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// --------------------
// Slice
// --------------------
const initialState: CartState = {
  cartId: null,
  items: [],
  total: 0,
  items_count: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.items_count = 0;
    },
    transferCart: (state) => {
      // For transferring session cart to user cart after login
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        if (payload?.data) {
          state.cartId = payload.data.id;
          state.items = Array.isArray(payload.data.items) ? payload.data.items : [];
          state.total = payload.data.total || 0;
          state.items_count = payload.data.items_count || 0;
        } else if (Array.isArray(payload)) {
          state.items = payload;
          state.total = payload.reduce(
            (sum: number, item: CartItem) => sum + parseFloat(item.price.toString()) * item.quantity,
            0
          );
          state.items_count = payload.length;
        } else if (payload?.items) {
          state.items = payload.items;
          state.total = payload.total || 0;
          state.items_count = payload.items_count || 0;
        } else {
          state.items = [];
          state.total = 0;
          state.items_count = 0;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = [];
        state.total = 0;
        state.items_count = 0;
      });
  },
});

export const { clearCart, transferCart } = cartSlice.actions;
export default cartSlice.reducer;