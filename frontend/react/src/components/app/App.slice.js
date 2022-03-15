import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loaded: false
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initializeApp: () => initialState,
    loadUser: (state, { payload: user }) => {
      state.user = user;
      state.loaded = true;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    endLoad: (state) => {
      state.loaded = true;
    }
  }
});

export const { loadUser, logoutUser, endLoad, initializeApp } = slice.actions;

export default slice.reducer;
