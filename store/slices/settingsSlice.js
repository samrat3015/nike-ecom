import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch general site settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const res = await fetch(`${apiBaseUrl}/site-infos`);
    if (!res.ok) {
      throw new Error('Failed to fetch settings');
    }
    const data = await res.json();
    return data;
  }
);

// Fetch slider data
export const fetchSlider = createAsyncThunk(
  'settings/fetchSlider',
  async () => {
    const res = await fetch(`${apiBaseUrl}/sliders`);
    if (!res.ok) {
      throw new Error('Failed to fetch slider');
    }
    const data = await res.json();
    return data;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: {},
    settingsLoading: false,
    settingsError: null,
    slider: [],
    sliderLoading: false,
    sliderError: null,
    media: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    // Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settings = action.payload.generalSettings || {};
        state.media = action.payload.media || {};
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.error.message;
      });

    // Slider
    builder
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
        state.sliderError = action.error.message;
      });
  },
});

export default settingsSlice.reducer;
