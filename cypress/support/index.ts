declare global {
  namespace Cypress {
    interface Chainable {
      createDefaultTodos(): Chainable
      createTodo(todo: string): Chainable
    }
  }
}

import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
