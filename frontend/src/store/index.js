import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import servicesReducer from './slices/servicesSlice'
import dealsReducer from './slices/dealsSlice'
import ordersReducer from './slices/ordersSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    deals: dealsReducer,
    orders: ordersReducer,
    subscription: subscriptionReducer,
    notifications: notificationReducer,
  },
})
