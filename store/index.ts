// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categoriesSlice';
import settingsReducer from './slices/settingsSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

import counterReducer from './slices/counterSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    settings: settingsReducer,
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
    counter: counterReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Add a helper type for AsyncThunkAction
export type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  extra?: unknown;
  rejectValue?: unknown;
  serializedErrorType?: unknown;
};

export default store;
