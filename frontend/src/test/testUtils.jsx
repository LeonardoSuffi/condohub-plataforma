import { render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import authReducer from '../store/slices/authSlice'
import servicesReducer from '../store/slices/servicesSlice'
import dealsReducer from '../store/slices/dealsSlice'
import notificationReducer from '../store/slices/notificationSlice'
import subscriptionReducer from '../store/slices/subscriptionSlice'

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        services: servicesReducer,
        deals: dealsReducer,
        notifications: notificationReducer,
        subscription: subscriptionReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock user data
export const mockEmpresaUser = {
  id: 1,
  name: 'Test Empresa',
  email: 'empresa@test.com',
  type: 'empresa',
  active: true,
  companyProfile: {
    id: 1,
    cnpj: '12345678000199',
    razao_social: 'Empresa Teste LTDA',
    nome_fantasia: 'Empresa Teste',
    telefone: '11999999999',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  subscription: {
    id: 1,
    status: 'ativa',
    plan: {
      id: 1,
      name: 'Gratuito',
      slug: 'gratuito',
    },
  },
}

export const mockClienteUser = {
  id: 2,
  name: 'Test Cliente',
  email: 'cliente@test.com',
  type: 'cliente',
  active: true,
  clientProfile: {
    id: 1,
    cpf: '12345678901',
    tipo: 'sindico',
    nome_condominio: 'Condominio Teste',
    telefone: '11888888888',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
}

export const mockService = {
  id: 1,
  title: 'Servico Teste',
  description: 'Descricao do servico teste',
  category: { id: 1, name: 'Manutencao', slug: 'manutencao' },
  region: 'Sao Paulo',
  price_range: '1000-5000',
  status: 'ativo',
  featured: false,
}

export const mockDeal = {
  id: 1,
  status: 'negociando',
  anon_handle_a: 'Empresa #123',
  anon_handle_b: 'Cliente #456',
  service: mockService,
  created_at: new Date().toISOString(),
}

export const mockNotification = {
  id: 1,
  type: 'system',
  title: 'Test Notification',
  message: 'This is a test notification',
  read_at: null,
  created_at: new Date().toISOString(),
}
