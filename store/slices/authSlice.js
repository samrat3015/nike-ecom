import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from "react-toastify";
import Cookies from 'js-cookie';
import { fetchCart } from "./cartSlice";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const userRegister = createAsyncThunk(
    'auth/userRegister',
    async (payload, thunkAPI) => {
        try {
            const res = await fetch(`${apiBaseUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok) {
                return result;
            } else {
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
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.access_token = null;
            Cookies.remove('access_token'); // Clear the token cookie
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(userRegister.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userRegister.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(action.payload.message || 'Registration successful');
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
                toast.success(action.payload.message || 'Login successful');
            })
            .addCase(userLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // Update user data
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            });
    },
});

export { userRegister, userLogin, fetchUser };
export const { logout } = authSlice.actions;
export default authSlice.reducer;