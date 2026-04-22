import { createContext, useContext, useState, useCallback } from 'react'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDealId, setActiveDealId] = useState(null)
  const [minimized, setMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const openChat = useCallback((dealId = null) => {
    setActiveDealId(dealId)
    setIsOpen(true)
    setMinimized(false)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
    setActiveDealId(null)
    setMinimized(false)
  }, [])

  const minimizeChat = useCallback(() => {
    setMinimized(true)
  }, [])

  const maximizeChat = useCallback(() => {
    setMinimized(false)
  }, [])

  const switchDeal = useCallback((dealId) => {
    setActiveDealId(dealId)
    setMinimized(false)
  }, [])

  const value = {
    isOpen,
    activeDealId,
    minimized,
    unreadCount,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    switchDeal,
    setUnreadCount,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export default ChatContext
