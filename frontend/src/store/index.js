import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import servicesReducer from './slices/servicesSlice'
import dealsReducer from './slices/dealsSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    deals: dealsReducer,
    subscription: subscriptionReducer,
    notifications: notificationReducer,
  },
})
