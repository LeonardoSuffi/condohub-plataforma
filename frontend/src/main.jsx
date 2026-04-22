import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store'
import AuthProvider from './components/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './components/theme-provider'
import { TooltipProvider } from './components/ui/tooltip'
import { ChatProvider } from './contexts/ChatContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="servicepro-ui-theme">
            <TooltipProvider>
              <AuthProvider>
                <ChatProvider>
                  <App />
                </ChatProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
