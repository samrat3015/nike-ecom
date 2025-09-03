import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from "react-toastify";
import Cookies from 'js-cookie';
import { fetchCart } from "./cartSlice";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Add initialization thunk to check for existing token
const initializeAuth = createAsyncThunk(
    'auth/initializeAuth',
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get('access_token');
            if (token) {
                // If token exists, fetch user data to verify it's still valid
                await thunkAPI.dispatch(fetchUser());
                return { hasToken: true };
            }
            return { hasToken: false };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const userRegister = createAsyncThunk(
    'auth/userRegister',
    async (payload, thunkAPI) => {
        try {
            const res = await fetch(`${apiBaseUrl}/auth/register`, { // Fixed endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok) {
                // Store the access token in a cookie immediately after registration
                Cookies.set('access_token', result.access_token, { expires: 1 / 24, secure: true, sameSite: 'Strict' });
                
                // Fetch user data after registration
                await thunkAPI.dispatch(fetchUser());
                await thunkAPI.dispatch(fetchCart());
                
                return result;
            } else {
                // Handle validation errors properly
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat();
                    return thunkAPI.rejectWithValue(errorMessages.join(', '));
                }
                return thunkAPI.rejectWithValue(result.message || 'Registration failed');
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const userLogin = createAsyncThunk(
    'auth/userLogin',
    async (payload, thunkAPI) => {
        try {
            const res = await fetch(`${apiBaseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok) {
                // Store the access token in a cookie
                Cookies.set('access_token', result.access_token, { expires: 1 / 24, secure: true, sameSite: 'Strict' }); // Expires in 1 hour
                await thunkAPI.dispatch(fetchUser());
                await thunkAPI.dispatch(fetchCart());
                return result;
            } else {
                return thunkAPI.rejectWithValue(result.message || 'Login failed');
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get('access_token'); // Retrieve the token from cookies
            if (!token) {
                return thunkAPI.rejectWithValue('No access token found');
            }
            const res = await fetch(`${apiBaseUrl}/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Include the Bearer token
                },
            });
            const result = await res.json();
            if (res.ok) {
                return result;
            } else {
                // If token is invalid, clear it
                if (res.status === 401) {
                    Cookies.remove('access_token');
                }
                return thunkAPI.rejectWithValue(result.message || 'Failed to fetch user data');
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        access_token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        initialized: false, // Add this to track if auth has been initialized
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.access_token = null;
            state.isAuthenticated = false;
            Cookies.remove('access_token'); // Clear the token cookie
            
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Add initializeAuth cases
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.initialized = true;
                // Don't set isAuthenticated here - let fetchUser handle it
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.loading = false;
                state.initialized = true;
                state.error = action.payload;
            })
            .addCase(userRegister.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userRegister.fulfilled, (state, action) => {
                state.loading = false;
                state.access_token = action.payload.access_token;
                // Note: user will be set when fetchUser completes
                toast.success(action.payload.message || 'Registration successful! Welcome!');
            })
            .addCase(userRegister.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(userLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.access_token = action.payload.access_token; // Store token in state
                state.isAuthenticated = true;
                toast.success(action.payload.message || 'Login successful');
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(fetchUser.pending, (state) => {
                // Don't show loading for fetchUser as it's usually called automatically
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // Update user data
                state.access_token = Cookies.get('access_token'); // Sync token from cookie
                state.isAuthenticated = true;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                // Clear token from state if fetch failed
                state.access_token = null;
                // Only show toast error if it's not a "no token" error
                if (!action.payload.includes('No access token found')) {
                    toast.error('Failed to fetch user data');
                }
            });
    },
});

export { userRegister, userLogin, fetchUser, initializeAuth };
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;