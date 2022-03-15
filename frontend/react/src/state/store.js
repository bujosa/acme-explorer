import { configureStore } from '@reduxjs/toolkit';
import app from '../components/app/App.slice';

export const store = configureStore({
  reducer: { app },
  devTools: {
    name: 'Acme Explorer'
  }
});

export function dispatchOnCall (action) {
  return () => store.dispatch(action);
}
