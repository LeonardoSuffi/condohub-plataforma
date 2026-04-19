import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Create MSW server for Node.js (used in tests)
export const server = setupServer(...handlers)
