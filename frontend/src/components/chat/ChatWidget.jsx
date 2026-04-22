import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '@/contexts/ChatContext'
import { fetchDeals } from '@/store/slices/dealsSlice'
import ChatModal from './ChatModal'
import { MessageSquare } from 'lucide-react'

export default function ChatWidget() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { deals } = useSelector((state) => state.deals)
  const { isOpen, openChat } = useChat()

  // Load deals count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDeals({ per_page: 50 }))
    }
  }, [dispatch, isAuthenticated])

  // Don't show widget if not authenticated
  if (!isAuthenticated) return null

  const activeDeals = (deals || []).filter(d => ['aberto', 'negociando'].includes(d.status))
  const hasActiveDeals = activeDeals.length > 0

  return (
    <>
      {/* Floating Button - only show when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => openChat()}
          className="fixed bottom-6 right-6 z-40 group"
        >
          <div className="relative">
            {/* Pulse animation for active deals */}
            {hasActiveDeals && (
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
            )}

            {/* Main button */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-slate-500/30 hover:scale-105 transition-all flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>

            {/* Badge */}
            {hasActiveDeals && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {activeDeals.length > 9 ? '9+' : activeDeals.length}
              </span>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {hasActiveDeals ? `${activeDeals.length} conversa${activeDeals.length > 1 ? 's' : ''} ativa${activeDeals.length > 1 ? 's' : ''}` : 'Mensagens'}
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </button>
      )}

      {/* Chat Modal */}
      <ChatModal />
    </>
  )
}
