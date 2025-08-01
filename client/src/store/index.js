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
});

export default store; 