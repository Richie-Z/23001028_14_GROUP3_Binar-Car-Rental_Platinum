import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  start_rent_at: "",
  finish_rent_at: "",
  start_date: "",
  end_date: "",
  is_disabled: false,
  loading: false,
};

export const detailSlice = createSlice({
  name: "detail",
  initialState,
  reducers: {
    disableButton: (state) => {
      state.is_disabled = false;
    },
    enableButton: (state) => {
      state.is_disabled = true;
    },
    saveDateRent: (state, action) => {
      state.start_date = action.payload.start_date;
      state.end_date = action.payload.end_date;
      state.start_rent_at = action.payload.start_rent_at;
      state.finish_rent_at = action.payload.finish_rent_at;
    },
    resetDateRent: (state) => {
      (state.start_rent_at = ""),
        (state.finish_rent_at = ""),
        (state.start_date = ""),
        (state.end_date = "");
    },
  },
});

export const { disableButton, enableButton, saveDateRent, resetDateRent } =
  detailSlice.actions;

export default detailSlice.reducer;
