import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define types
export interface Product {
  id: number;
  name: string;
  category?: {
    slug?: string;
  };
  [key: string]: any; // Add other product fields as needed
}

export type CategoryProducts = Record<string, Product[]>;

interface ProductsState {
  products: CategoryProducts;
  loading: boolean;
  error: string | null;
}

// Initial state with types
const initialState: ProductsState = {
  products: {},
  loading: false,
  error: null,
};

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk<CategoryProducts, void, { rejectValue: string }>(
  'products/fetchProducts',
  async () => {
    const res = await fetch(`${apiBaseUrl}/category-with-products`);
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await res.json();
    return data.data || {};
  }
);

const productsSlice = createSlice({
  name: 'products',
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
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export default productsSlice.reducer;