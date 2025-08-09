import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import commentsReducer from './slices/commentsSlice';
import userReducer from './slices/userSlice';
import counterReducer from './slices/counterSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    comments: commentsReducer,
    user: userReducer,
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for better performance
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      immutableCheck: {
        // Disable immutable checks in production for better performance
        ignoredPaths: process.env.NODE_ENV === 'production' ? ['auth', 'projects', 'comments', 'user', 'counter'] : [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 