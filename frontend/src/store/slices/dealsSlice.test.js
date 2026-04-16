import { describe, it, expect, vi, beforeEach } from 'vitest'
import dealsReducer, {
  clearCurrentDeal,
  clearError,
  addMessage,
} from './dealsSlice'

describe('dealsSlice', () => {
  const initialState = {
    deals: [],
    currentDeal: null,
    messages: [],
    dealStatus: null,
    isAnonymous: true,
    meta: null,
    loading: false,
    loadingDetail: false,
    loadingMessages: false,
    sendingMessage: false,
    error: null,
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(dealsReducer(undefined, { type: 'unknown' })).toEqual(
        expect.objectContaining({
          deals: [],
          isAnonymous: true,
        })
      )
    })

    it('should handle clearCurrentDeal', () => {
      const stateWithDeal = {
        ...initialState,
        currentDeal: { id: 1, status: 'negociando' },
        messages: [{ id: 1, content: 'Test' }],
        dealStatus: 'negociando',
        isAnonymous: false,
        loadingDetail: true,
      }

      const state = dealsReducer(stateWithDeal, clearCurrentDeal())

      expect(state.currentDeal).toBeNull()
      expect(state.messages).toEqual([])
      expect(state.dealStatus).toBeNull()
      expect(state.isAnonymous).toBe(true)
      expect(state.loadingDetail).toBe(false)
    })

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      }

      const state = dealsReducer(stateWithError, clearError())

      expect(state.error).toBeNull()
    })

    it('should handle addMessage without duplicates', () => {
      const existingMessages = [{ id: 1, content: 'Message 1' }]
      const newMessage = { id: 2, content: 'Message 2' }

      const state = dealsReducer(
        { ...initialState, messages: existingMessages },
        addMessage(newMessage)
      )

      expect(state.messages).toHaveLength(2)
      expect(state.messages[1]).toEqual(newMessage)
    })

    it('should not add duplicate message', () => {
      const existingMessages = [{ id: 1, content: 'Message 1' }]
      const duplicateMessage = { id: 1, content: 'Message 1' }

      const state = dealsReducer(
        { ...initialState, messages: existingMessages },
        addMessage(duplicateMessage)
      )

      expect(state.messages).toHaveLength(1)
    })
  })

  describe('async thunks - fetchDeals', () => {
    it('should set loading to true on pending', () => {
      const action = { type: 'deals/fetchDeals/pending' }
      const state = dealsReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update deals on fulfilled', () => {
      const mockPayload = {
        data: [
          { id: 1, status: 'negociando', anon_handle_a: 'Empresa #123' },
          { id: 2, status: 'aceito', anon_handle_a: 'Empresa #456' },
        ],
        meta: { total: 2 },
      }

      const action = { type: 'deals/fetchDeals/fulfilled', payload: mockPayload }
      const state = dealsReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.deals).toHaveLength(2)
      expect(state.meta).toEqual(mockPayload.meta)
    })

    it('should handle error on rejected', () => {
      const action = { type: 'deals/fetchDeals/rejected', payload: 'Network error' }
      const state = dealsReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
      expect(state.deals).toEqual([])
    })
  })

  describe('async thunks - createDeal', () => {
    it('should set loading to true on pending', () => {
      const action = { type: 'deals/createDeal/pending' }
      const state = dealsReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should add new deal to beginning on fulfilled', () => {
      const existingDeals = [{ id: 1, status: 'negociando' }]
      const newDeal = { id: 2, status: 'aberto', anon_handle_a: 'Empresa #789' }

      const action = { type: 'deals/createDeal/fulfilled', payload: newDeal }
      const state = dealsReducer(
        { ...initialState, deals: existingDeals, loading: true },
        action
      )

      expect(state.loading).toBe(false)
      expect(state.deals).toHaveLength(2)
      expect(state.deals[0]).toEqual(newDeal) // New deal added at beginning
    })
  })

  describe('async thunks - updateDealStatus', () => {
    it('should update deal in list on fulfilled', () => {
      const existingDeals = [
        { id: 1, status: 'negociando' },
        { id: 2, status: 'aberto' },
      ]
      const updatedDeal = { id: 1, status: 'aceito' }

      const action = { type: 'deals/updateDealStatus/fulfilled', payload: updatedDeal }
      const state = dealsReducer(
        { ...initialState, deals: existingDeals, loading: true },
        action
      )

      expect(state.loading).toBe(false)
      expect(state.deals[0].status).toBe('aceito')
    })

    it('should update currentDeal and dealStatus if same id', () => {
      const currentDeal = { id: 1, status: 'negociando' }
      const updatedDeal = { id: 1, status: 'aceito' }

      const action = { type: 'deals/updateDealStatus/fulfilled', payload: updatedDeal }
      const state = dealsReducer(
        { ...initialState, currentDeal, deals: [currentDeal], loading: true },
        action
      )

      expect(state.currentDeal.status).toBe('aceito')
      expect(state.dealStatus).toBe('aceito')
    })
  })

  describe('async thunks - fetchMessages', () => {
    it('should set loadingMessages on first fetch', () => {
      const action = { type: 'deals/fetchMessages/pending' }
      const state = dealsReducer(initialState, action)

      expect(state.loadingMessages).toBe(true)
    })

    it('should not set loading on refresh when messages exist', () => {
      const existingMessages = [{ id: 1, content: 'Existing' }]

      const action = { type: 'deals/fetchMessages/pending' }
      const state = dealsReducer({ ...initialState, messages: existingMessages }, action)

      expect(state.loadingMessages).toBe(false)
    })

    it('should update messages and status on fulfilled', () => {
      const mockPayload = {
        messages: [
          { id: 1, content: 'Message 1' },
          { id: 2, content: 'Message 2' },
        ],
        deal_status: 'negociando',
        is_anonymous: true,
      }

      const action = { type: 'deals/fetchMessages/fulfilled', payload: mockPayload }
      const state = dealsReducer({ ...initialState, loadingMessages: true }, action)

      expect(state.loadingMessages).toBe(false)
      expect(state.messages).toHaveLength(2)
      expect(state.dealStatus).toBe('negociando')
      expect(state.isAnonymous).toBe(true)
    })

    it('should update isAnonymous to false when revealed', () => {
      const mockPayload = {
        messages: [],
        deal_status: 'aceito',
        is_anonymous: false,
      }

      const action = { type: 'deals/fetchMessages/fulfilled', payload: mockPayload }
      const state = dealsReducer(initialState, action)

      expect(state.isAnonymous).toBe(false)
    })
  })

  describe('async thunks - sendMessage', () => {
    it('should set sendingMessage to true on pending', () => {
      const action = { type: 'deals/sendMessage/pending' }
      const state = dealsReducer(initialState, action)

      expect(state.sendingMessage).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should add message to list on fulfilled', () => {
      const existingMessages = [{ id: 1, content: 'Existing' }]
      const newMessage = { id: 2, content: 'New message' }

      const action = { type: 'deals/sendMessage/fulfilled', payload: newMessage }
      const state = dealsReducer(
        { ...initialState, messages: existingMessages, sendingMessage: true },
        action
      )

      expect(state.sendingMessage).toBe(false)
      expect(state.messages).toHaveLength(2)
      expect(state.messages[1]).toEqual(newMessage)
    })

    it('should not add duplicate message', () => {
      const existingMessages = [{ id: 1, content: 'Existing' }]
      const duplicateMessage = { id: 1, content: 'Existing' }

      const action = { type: 'deals/sendMessage/fulfilled', payload: duplicateMessage }
      const state = dealsReducer(
        { ...initialState, messages: existingMessages, sendingMessage: true },
        action
      )

      expect(state.messages).toHaveLength(1)
    })

    it('should handle error on rejected', () => {
      const action = { type: 'deals/sendMessage/rejected', payload: 'Failed to send' }
      const state = dealsReducer({ ...initialState, sendingMessage: true }, action)

      expect(state.sendingMessage).toBe(false)
      expect(state.error).toBe('Failed to send')
    })
  })
})
