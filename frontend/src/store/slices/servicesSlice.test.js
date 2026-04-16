import { describe, it, expect, vi, beforeEach } from 'vitest'
import servicesReducer, {
  clearCurrentService,
  clearError,
} from './servicesSlice'

describe('servicesSlice', () => {
  const initialState = {
    services: [],
    myServices: [],
    currentService: null,
    categories: [],
    meta: null,
    loading: false,
    loadingDetail: false,
    loadingMyServices: false,
    loadingCategories: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(servicesReducer(undefined, { type: 'unknown' })).toEqual(
        expect.objectContaining({
          services: [],
          loading: false,
        })
      )
    })

    it('should handle clearCurrentService', () => {
      const stateWithService = {
        ...initialState,
        currentService: { id: 1, title: 'Test Service' },
        loadingDetail: true,
      }

      const state = servicesReducer(stateWithService, clearCurrentService())

      expect(state.currentService).toBeNull()
      expect(state.loadingDetail).toBe(false)
    })

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error occurred',
      }

      const state = servicesReducer(stateWithError, clearError())

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchServices', () => {
    it('should set loading to true on pending', () => {
      const action = { type: 'services/fetchServices/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update services on fulfilled', () => {
      const mockPayload = {
        data: [
          { id: 1, title: 'Service 1' },
          { id: 2, title: 'Service 2' },
        ],
        meta: { total: 2, current_page: 1 },
      }

      const action = { type: 'services/fetchServices/fulfilled', payload: mockPayload }
      const state = servicesReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.services).toHaveLength(2)
      expect(state.meta).toEqual(mockPayload.meta)
    })

    it('should handle error on rejected', () => {
      const action = { type: 'services/fetchServices/rejected', payload: 'Network error' }
      const state = servicesReducer({ ...initialState, loading: true }, action)

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Network error')
      expect(state.services).toEqual([])
    })
  })

  describe('async thunks - fetchServiceDetail', () => {
    it('should set loadingDetail to true on pending', () => {
      const action = { type: 'services/fetchServiceDetail/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.loadingDetail).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update currentService on fulfilled', () => {
      const mockService = { id: 1, title: 'Service Detail', description: 'Test' }

      const action = { type: 'services/fetchServiceDetail/fulfilled', payload: mockService }
      const state = servicesReducer({ ...initialState, loadingDetail: true }, action)

      expect(state.loadingDetail).toBe(false)
      expect(state.currentService).toEqual(mockService)
    })

    it('should clear currentService on rejected', () => {
      const action = { type: 'services/fetchServiceDetail/rejected', payload: 'Not found' }
      const state = servicesReducer({ ...initialState, loadingDetail: true }, action)

      expect(state.loadingDetail).toBe(false)
      expect(state.currentService).toBeNull()
      expect(state.error).toBe('Not found')
    })
  })

  describe('async thunks - createService', () => {
    it('should set creating to true on pending', () => {
      const action = { type: 'services/createService/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.creating).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should add new service to myServices on fulfilled', () => {
      const existingServices = [{ id: 1, title: 'Existing Service' }]
      const newService = { id: 2, title: 'New Service' }

      const action = { type: 'services/createService/fulfilled', payload: newService }
      const state = servicesReducer(
        { ...initialState, myServices: existingServices, creating: true },
        action
      )

      expect(state.creating).toBe(false)
      expect(state.myServices).toHaveLength(2)
      expect(state.myServices[0]).toEqual(newService) // New service added at beginning
    })
  })

  describe('async thunks - updateService', () => {
    it('should set updating to true on pending', () => {
      const action = { type: 'services/updateService/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.updating).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should update service in myServices on fulfilled', () => {
      const existingServices = [
        { id: 1, title: 'Service 1' },
        { id: 2, title: 'Service 2' },
      ]
      const updatedService = { id: 1, title: 'Updated Service 1' }

      const action = { type: 'services/updateService/fulfilled', payload: updatedService }
      const state = servicesReducer(
        { ...initialState, myServices: existingServices, updating: true },
        action
      )

      expect(state.updating).toBe(false)
      expect(state.myServices[0].title).toBe('Updated Service 1')
    })

    it('should update currentService if same id', () => {
      const currentService = { id: 1, title: 'Current Service' }
      const updatedService = { id: 1, title: 'Updated Current Service' }

      const action = { type: 'services/updateService/fulfilled', payload: updatedService }
      const state = servicesReducer(
        { ...initialState, currentService, myServices: [currentService], updating: true },
        action
      )

      expect(state.currentService.title).toBe('Updated Current Service')
    })
  })

  describe('async thunks - deleteService', () => {
    it('should set deleting to true on pending', () => {
      const action = { type: 'services/deleteService/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.deleting).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should remove service from myServices on fulfilled', () => {
      const existingServices = [
        { id: 1, title: 'Service 1' },
        { id: 2, title: 'Service 2' },
      ]

      const action = { type: 'services/deleteService/fulfilled', payload: 1 }
      const state = servicesReducer(
        { ...initialState, myServices: existingServices, deleting: true },
        action
      )

      expect(state.deleting).toBe(false)
      expect(state.myServices).toHaveLength(1)
      expect(state.myServices[0].id).toBe(2)
    })

    it('should clear currentService if deleted service is current', () => {
      const currentService = { id: 1, title: 'Current Service' }

      const action = { type: 'services/deleteService/fulfilled', payload: 1 }
      const state = servicesReducer(
        { ...initialState, currentService, myServices: [currentService], deleting: true },
        action
      )

      expect(state.currentService).toBeNull()
    })
  })

  describe('async thunks - fetchCategories', () => {
    it('should set loadingCategories to true on pending', () => {
      const action = { type: 'services/fetchCategories/pending' }
      const state = servicesReducer(initialState, action)

      expect(state.loadingCategories).toBe(true)
    })

    it('should update categories on fulfilled', () => {
      const mockCategories = [
        { id: 1, name: 'Manutencao', slug: 'manutencao' },
        { id: 2, name: 'Limpeza', slug: 'limpeza' },
      ]

      const action = { type: 'services/fetchCategories/fulfilled', payload: mockCategories }
      const state = servicesReducer({ ...initialState, loadingCategories: true }, action)

      expect(state.loadingCategories).toBe(false)
      expect(state.categories).toEqual(mockCategories)
    })
  })
})
