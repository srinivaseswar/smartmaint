import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoleKey } from '@/types';
import { users } from '@/data/seed';

export interface AuthState {
  user: typeof users[number] | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<RoleKey>) {
      const user = users.find((u) => u.role === action.payload);
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
