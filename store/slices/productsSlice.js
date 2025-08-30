import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async () => {
        const res = await fetch(`${apiBaseUrl}/category-with-products`);
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        return data;
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
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
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default productsSlice.reducer;