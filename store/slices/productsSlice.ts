import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Product {
  id: number;
  name: string;
  slug: string;
  feature_image: string;
  price: string | number;
  previous_price?: string | number;
  category?: { slug?: string; name?: string };
  [key: string]: any;
}

export type CategoryProducts = Record<string, Product[]>;

interface ProductsState {
  products: CategoryProducts;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: {},
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<
  CategoryProducts,
  void,
  { rejectValue: string }
>("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    //console.log("Fetching from:", `${apiBaseUrl}/category-with-products`);
    const res = await fetch(`${apiBaseUrl}/category-with-products`);
    if (!res.ok) {
      const errorText = await res.text();
      return rejectWithValue(`Failed to fetch products: ${res.status} ${errorText}`);
    }
    const data = await res.json();
    //console.log("API response:", data);
    // Directly return the response, as it matches CategoryProducts
    if (!data || typeof data !== "object") {
      return rejectWithValue("Invalid data format received");
    }
    return data; // Changed from data.data to data
  } catch (error: any) {
    return rejectWithValue(error.message || "Fetch error");
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        console.log("Processed payload:", payload);
        if (payload && typeof payload === "object") {
          state.products = Object.entries(payload).reduce(
            (acc, [key, value]) => {
              if (Array.isArray(value)) {
                acc[key] = value.map((product) => ({
                  ...product,
                  price: product.price || 0,
                  feature_image: product.feature_image || "",
                  slug: product.slug || `product-${product.id}`,
                }));
              }
              return acc;
            },
            {} as CategoryProducts
          );
        } else {
          state.products = {};
          state.error = "Invalid data format received";
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || "Failed to fetch products";
        state.products = {};
        console.error("Fetch error:", state.error);
      });
  },
});

export default productsSlice.reducer;