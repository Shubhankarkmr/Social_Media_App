import { createSlice } from "@reduxjs/toolkit";

const savedTheme = window?.localStorage.getItem("theme");

let initialTheme;
try {
  initialTheme = savedTheme ? JSON.parse(savedTheme) : "dark";
} catch {
  initialTheme = savedTheme || "dark"; // fallback if invalid JSON
}

const initialState = {
  theme: initialTheme,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", JSON.stringify(action.payload));
    },
  },
});

export default themeSlice.reducer;

export function SetTheme(value) {
  return (dispatch) => {
    dispatch(themeSlice.actions.setTheme(value));
  };
}

