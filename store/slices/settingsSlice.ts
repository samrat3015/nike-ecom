import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Settings {
  shipping_charge_inside_dhaka: number;
  shipping_charge_outside_dhaka: number;
  appliedCoupon?: any | null;
}

interface SettingsState {
  settings: Settings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  slider: any[];
  sliderLoading: boolean;
  sliderError: string | null;
  media: Record<string, any>;
  facebook_pixel_info: Record<string, any>;
}

const initialState: SettingsState = {
  settings: null,
  settingsLoading: false,
  settingsError: null,
  slider: [],
  sliderLoading: false,
  sliderError: null,
  media: {},
  facebook_pixel_info: {},
};

// Fetch general site settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const res = await fetch(`${apiBaseUrl}/site-infos`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data;
  }
);

// Fetch slider data
export const fetchSlider = createAsyncThunk(
  'settings/fetchSlider',
  async () => {
    const res = await fetch(`${apiBaseUrl}/sliders`);
    if (!res.ok) throw new Error('Failed to fetch slider');
    const data = await res.json();
    return data;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Settings
      .addCase(fetchSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = {
          shipping_charge_inside_dhaka:
            action.payload.generalSettings?.shipping_charge_inside_dhaka || 0,
          shipping_charge_outside_dhaka:
            action.payload.generalSettings?.shipping_charge_outside_dhaka || 0,
          appliedCoupon: action.payload.generalSettings?.appliedCoupon || null,
        };
        state.media = action.payload.media || {};
        state.facebook_pixel_info = action.payload.facebook_pixel_info || {};
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.error.message || null;
      })

      // Slider
      .addCase(fetchSlider.pending, (state) => {
        state.sliderLoading = true;
        state.sliderError = null;
      })
      .addCase(fetchSlider.fulfilled, (state, action) => {
        state.sliderLoading = false;
        state.slider = action.payload || [];
      })
      .addCase(fetchSlider.rejected, (state, action) => {
        state.sliderLoading = false;
        state.sliderError = action.error.message || null;
      });
  },
});

export default settingsSlice.reducer;
