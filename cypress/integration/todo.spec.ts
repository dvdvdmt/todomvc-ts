/// <reference types="cypress" />

// checks that local storage has an item with given text
const checkTodosInLocalStorage = (presentText: string) => {
  cy.log(`Looking for "${presentText}" in localStorage`)

  return cy
    .window()
    .its('localStorage')
    .then((storage) => {
      return new Cypress.Promise((resolve) => {
        function checkItems() {
          if (
            Object.keys(storage).some((key) => {
              return storage.getItem(key)?.includes(presentText)
            })
          ) {
            resolve()
          } else {
            setTimeout(checkItems, 0)
          }
        }

        checkItems()
      })
    })
}

const checkCompletedKeywordInLocalStorage = () => {
  cy.log(`Looking for any completed items in localStorage`)

  const variants = ['complete', 'isComplete']

  return cy
    .window()
    .its('localStorage')
    .then((storage) => {
      return new Cypress.Promise((resolve) => {
        const checkItems = () => {
          if (
            Object.keys(storage).some((key) => {
              const text = storage.getItem(key)
              return variants.some((variant) => text?.includes(variant))
            })
          ) {
            resolve()
          } else {
            setTimeout(checkItems, 0)
          }
        }
        checkItems()
      })
    })
}

const checkNumberOfTodosInLocalStorage = (n: number) => {
  cy.log(`localStorage should have ${n} todo items`)

  return cy
    .window()
    .its('localStorage')
    .then((storage) => {
      return new Cypress.Promise((resolve) => {
        const checkItems = () => {
          if (
            Object.keys(storage).some((key) => {
              const text = storage.getItem(key)
              if (!text) {
                return false
              }
              // assuming it is an array
              try {
                const items = JSON.parse(text)
                return items.length === n
              } catch (e) {
                // ignore
                return false
              }
            })
          ) {
            resolve()
          } else {
            setTimeout(checkItems, 0)
          }
        }
        checkItems()
      })
    })
}

const checkNumberOfCompletedTodosInLocalStorage = (n: number) => {
  cy.log(`Looking for "${n}" completed items in localStorage`)

  return cy
    .window()
    .its('localStorage')
    .then((storage) => {
      return new Cypress.Promise((resolve) => {
        const checkItems = () => {
          if (
            Object.keys(storage).some((key) => {
              const text = storage.getItem(key)
              if (!text) {
                return false
              }
              // assuming it is an array
              try {
                const items = JSON.parse(text)
                if (items.length < n) {
                  return
                }
                const completed = Cypress._.filter(items, {completed: true})
                return completed.length === n
              } catch (e) {
                return
              }
            })
          ) {
            return resolve()
          } else {
            setTimeout(checkItems, 0)
          }
        }
        checkItems()
      })
    })
}

describe('example to-do app', function () {
  // setup these constants to match what TodoMVC does
  let TODO_ITEM_ONE = 'buy some cheese'
  let TODO_ITEM_TWO = 'feed the cat'
  let TODO_ITEM_THREE = 'book a doctors appointment'

  // different selectors depending on the app - some use ids, some use classes
  let selectors = {
    newTodo: '.new-todo',
    todoList: '.todo-list',
    todoItems: '.todo-list li',
    todoItemsVisible: '.todo-list li:visible',
    count: 'span.todo-count',
    main: '.main',
    footer: '.footer',
    toggleAll: '.toggle-all',
    clearCompleted: '.clear-completed',
    filters: '.filters',
    filterItems: '.filters li a',
  }

  // reliably works in backbone app and other apps by using single selector
  const visibleTodos = () => cy.get(selectors.todoItemsVisible)

  const hasNoItems = () => cy.get(selectors.todoItems).should('have.length', 0)

  const checkItemSaved = () => {
    cy.wrap(localStorageSetItem, {log: false}).should('have.been.called')
    cy.wrap(localStorageSetItem, {log: false}).invoke('reset')
  }

  let localStorageSetItem: Storage['setItem']

  beforeEach(function () {
    cy.visit('/', {
      onBeforeLoad(win: Cypress.AUTWindow) {
        localStorageSetItem = cy.spy(win.localStorage.__proto__, 'setItem')
      },
    })
  })

  beforeEach(() => {
    // catch any framework that debounces its localStorage writes
    // and causes items to "appear" in a new test all of the sudden
    hasNoItems()
  })

  context('When page is initially opened', function () {
    it('should focus on the todo input field', function () {
      // get the currently focused element and assert
      // that it has class='new-todo'
      //
      // http://on.cypress.io/focused
      cy.focused().should('have.id', 'new-todo')
    })
  })

  context('No Todos', function () {
    it('starts with nothing', () => {
      hasNoItems()
    })

    it('should hide #main and #footer', function () {
      cy.get(selectors.todoItems).should('not.exist')
      // some apps remove elements from the DOM
      // but some just hide them
      cy.get(selectors.main).should('not.be.visible')
      cy.get(selectors.footer).should('not.be.visible')
    })
  })

  context('New Todo', function () {
    it('should allow me to add todo items', function () {
      // create 1st todo
      cy.get(selectors.newTodo).type(`${TODO_ITEM_ONE}{enter}`)
      checkItemSaved()

      // make sure the 1st label contains the 1st todo text
      cy.get(selectors.todoItems).eq(0).find('label').should('contain', TODO_ITEM_ONE)

      // create 2nd todo
      cy.get(selectors.newTodo).type(`${TODO_ITEM_TWO}{enter}`)
      checkItemSaved()

      // make sure the 2nd label contains the 2nd todo text
      cy.get(selectors.todoItems).eq(1).find('label').should('contain', TODO_ITEM_TWO)

      // make sure a framework that debounces its writes into localStorage
      // had a chance to write them
      checkNumberOfTodosInLocalStorage(2)
    })

    it('should clear text input field when an item is added', function () {
      cy.get(selectors.newTodo).type(`${TODO_ITEM_ONE}{enter}`)
      cy.get(selectors.newTodo).should('have.text', '')
      checkNumberOfTodosInLocalStorage(1)
    })

    it('should append new items to the bottom of the list', function () {
      // this is an example of a custom command
      // which is stored in tests/_support/spec_helper.js
      // you should open up the spec_helper and look at
      // the comments!
      cy.createDefaultTodos().as('todos')

      // even though the text content is split across
      // multiple <span> and <strong> elements
      // `cy.contains` can verify this correctly
      cy.get(selectors.count).contains('3')

      cy.get('@todos').eq(0).find('label').should('contain', TODO_ITEM_ONE)
      cy.get('@todos').eq(1).find('label').should('contain', TODO_ITEM_TWO)
      cy.get('@todos').eq(2).find('label').should('contain', TODO_ITEM_THREE)
      checkNumberOfTodosInLocalStorage(3)
    })

    it('should trim text input', function () {
      // this is an example of another custom command
      // since we repeat the todo creation over and over
      // again. It's up to you to decide when to abstract
      // repetitive behavior and roll that up into a custom
      // command vs explicitly writing the code.
      cy.createTodo(`    ${TODO_ITEM_ONE}    `)

      // we use as explicit assertion here about the text instead of
      // using 'contain' so we can specify the exact text of the element
      // does not have any whitespace around it
      cy.get(selectors.todoItems).eq(0).find('label').should('have.text', TODO_ITEM_ONE)
      checkNumberOfTodosInLocalStorage(1)
    })

    it('should show #main and #footer when items added', function () {
      cy.createTodo(TODO_ITEM_ONE)
      cy.get(selectors.main).should('be.visible')
      cy.get(selectors.footer).should('be.visible')
      checkNumberOfTodosInLocalStorage(1)
    })
  })

  context('Mark all as completed', function () {
    // New commands used here:
    // - cy.check    https://on.cypress.io/api/check
    // - cy.uncheck  https://on.cypress.io/api/uncheck

    beforeEach(function () {
      // This is an example of aliasing
      // within a hook (beforeEach).
      // Aliases will automatically persist
      // between hooks and are available
      // in your tests below
      cy.createDefaultTodos().as('todos')
      checkNumberOfTodosInLocalStorage(3)
      checkItemSaved()
    })

    afterEach(() => {
      // each test in this block creates 3 todo itesm
      // make sure they are written into the storage
      // before starting a new test
      checkNumberOfTodosInLocalStorage(3)
    })

    it('should allow me to mark all items as completed', function () {
      // complete all todos
      // we use 'check' instead of 'click'
      // because that indicates our intention much clearer
      cy.get(selectors.toggleAll).check({force: true})
      checkItemSaved()

      // get each todo li and ensure its class is 'completed'
      cy.get('@todos').eq(0).should('have.class', 'completed')
      cy.get('@todos').eq(1).should('have.class', 'completed')
      cy.get('@todos').eq(2).should('have.class', 'completed')
      checkNumberOfCompletedTodosInLocalStorage(3)
    })

    it('should allow me to clear the complete state of all items', function () {
      // check and then immediately uncheck
      cy.get(selectors.toggleAll).check({force: true})
      checkItemSaved()
      cy.get(selectors.toggleAll).uncheck({force: true})
      checkItemSaved()

      cy.get('@todos').eq(0).should('not.have.class', 'completed')
      cy.get('@todos').eq(1).should('not.have.class', 'completed')
      cy.get('@todos').eq(2).should('not.have.class', 'completed')
      checkNumberOfCompletedTodosInLocalStorage(0)
    })

    it('complete all checkbox should update state when items are completed / cleared', function () {
      cy.get(selectors.toggleAll).check({force: true})
      // this assertion is silly here IMO but
      // it is what TodoMVC does
      checkItemSaved()
      cy.get(selectors.toggleAll).should('be.checked')

      // alias the first todo and then click it
      cy.get(selectors.todoItems).eq(0).as('firstTodo').find('.toggle').uncheck({force: true})
      checkItemSaved()

      // reference the .toggle-all element again
      // and make sure its not checked
      cy.get(selectors.toggleAll).should('not.be.checked')

      // reference the first todo again and now toggle it
      cy.get('@firstTodo').find('.toggle').check({force: true})
      checkItemSaved()
      checkNumberOfCompletedTodosInLocalStorage(3)

      // assert the toggle all is checked again
      cy.get(selectors.toggleAll).should('be.checked')
    })
  })

  context('Item', function () {
    // New commands used here:
    // - cy.clear    https://on.cypress.io/api/clear

    it('should allow me to mark items as complete', function () {
      // we are aliasing the return value of
      // our custom command 'createTodo'
      //
      // the return value is the <li> in the <ul.todos-list>
      cy.createTodo(TODO_ITEM_ONE).as('firstTodo')
      cy.createTodo(TODO_ITEM_TWO).as('secondTodo')

      cy.get('@firstTodo').find('.toggle').check()
      cy.get('@firstTodo').should('have.class', 'completed')

      cy.get('@secondTodo').should('not.have.class', 'completed')
      cy.get('@secondTodo').find('.toggle').check()

      cy.get('@firstTodo').should('have.class', 'completed')
      cy.get('@secondTodo').should('have.class', 'completed')
      checkNumberOfCompletedTodosInLocalStorage(2)
    })

    it('should allow me to un-mark items as complete', function () {
      cy.createTodo(TODO_ITEM_ONE).as('firstTodo')
      cy.createTodo(TODO_ITEM_TWO).as('secondTodo')

      cy.get('@firstTodo').find('.toggle').check()
      cy.get('@firstTodo').should('have.class', 'completed')
      cy.get('@secondTodo').should('not.have.class', 'completed')
      checkNumberOfCompletedTodosInLocalStorage(1)

      cy.get('@firstTodo').find('.toggle').uncheck()
      cy.get('@firstTodo').should('not.have.class', 'completed')
      cy.get('@secondTodo').should('not.have.class', 'completed')

      checkNumberOfCompletedTodosInLocalStorage(0)
    })

    it('should allow me to edit an item', function () {
      cy.createDefaultTodos()
      checkTodosInLocalStorage(TODO_ITEM_TWO)

      visibleTodos()
        .eq(1)
        // TODO: fix this, dblclick should
        // have been issued to label
        .find('label')
        .dblclick()

      // clear out the inputs current value
      // and type a new value
      visibleTodos()
        .eq(1)
        .find('.edit')
        .should('have.value', TODO_ITEM_TWO)
        // clear + type text + enter key
        .clear()
        .type('buy some sausages{enter}')

      // explicitly assert about the text value
      visibleTodos().eq(0).should('contain', TODO_ITEM_ONE)
      visibleTodos().eq(1).should('contain', 'buy some sausages')
      visibleTodos().eq(2).should('contain', TODO_ITEM_THREE)
      checkTodosInLocalStorage('buy some sausages')
    })
  })

  context('Editing', function () {
    // New commands used here:
    // - cy.blur    https://on.cypress.io/api/blur

    beforeEach(function () {
      cy.createDefaultTodos().as('todos')
      checkNumberOfTodosInLocalStorage(3)
    })

    it('should hide other controls when editing', function () {
      cy.get('@todos').eq(1).find('label').dblclick()

      cy.get(selectors.todoItems).eq(1).find('.toggle').should('not.be.visible')
      cy.get(selectors.todoItems).eq(1).find('label').should('not.be.visible')
      checkNumberOfTodosInLocalStorage(3)
    })

    it('should save edits on blur', function () {
      cy.get('@todos').eq(1).find('label').dblclick()

      cy.get(selectors.todoItems)
        .eq(1)
        .find('.edit')
        .clear()
        .type('buy some sausages')
        // we can just send the blur event directly
        // to the input instead of having to click
        // on another button on the page. though you
        // could do that its just more mental work
        .blur()

      visibleTodos().eq(0).should('contain', TODO_ITEM_ONE)
      visibleTodos().eq(1).should('contain', 'buy some sausages')
      visibleTodos().eq(2).should('contain', TODO_ITEM_THREE)
      checkTodosInLocalStorage('buy some sausages')
    })

    it('should trim entered text', function () {
      cy.get('@todos').eq(1).find('label').dblclick()
      checkTodosInLocalStorage(TODO_ITEM_TWO)

      cy.get(selectors.todoItems)
        .eq(1)
        .find('.edit')
        .type('{selectall}{backspace}    buy some sausages    {enter}')

      visibleTodos().eq(0).should('contain', TODO_ITEM_ONE)
      visibleTodos().eq(1).should('contain', 'buy some sausages')
      visibleTodos().eq(2).should('contain', TODO_ITEM_THREE)
      checkTodosInLocalStorage('buy some sausages')
    })

    it('should remove the item if an empty text string was entered', function () {
      cy.get('@todos').eq(1).find('label').dblclick()

      cy.get(selectors.todoItems).eq(1).find('.edit').clear().type('{enter}')

      visibleTodos().should('have.length', 2)
      checkNumberOfTodosInLocalStorage(2)
    })

    it('should cancel edits on escape', function () {
      visibleTodos().eq(1).find('label').dblclick()

      cy.get(selectors.todoItems).eq(1).find('.edit').type('{selectall}{backspace}foo{esc}')

      visibleTodos().eq(0).should('contain', TODO_ITEM_ONE)
      visibleTodos().eq(1).should('contain', TODO_ITEM_TWO)
      visibleTodos().eq(2).should('contain', TODO_ITEM_THREE)
      checkNumberOfTodosInLocalStorage(3)
    })
  })

  context('Counter', function () {
    it('should display the current number of todo items', function () {
      cy.createTodo(TODO_ITEM_ONE)
      cy.get(selectors.count).contains('1')
      cy.createTodo(TODO_ITEM_TWO)
      cy.get(selectors.count).contains('2')
      checkNumberOfTodosInLocalStorage(2)
    })
  })

  context('Clear completed button', function () {
    beforeEach(function () {
      cy.createDefaultTodos().as('todos')
    })

    it('should display the correct text', function () {
      cy.get('@todos').eq(0).find('.toggle').check()
      cy.get(selectors.clearCompleted).contains('Clear completed')
    })

    it('should remove completed items when clicked', function () {
      cy.get('@todos').eq(1).find('.toggle').check()
      cy.get(selectors.clearCompleted).click()
      cy.get('@todos').should('have.length', 2)
      cy.get('@todos').eq(0).should('contain', TODO_ITEM_ONE)
      cy.get('@todos').eq(1).should('contain', TODO_ITEM_THREE)
    })

    it('should be hidden when there are no items that are completed', function () {
      cy.get('@todos').eq(1).find('.toggle').check()
      cy.get(selectors.clearCompleted).should('be.visible').click()
      cy.get(selectors.clearCompleted).should('not.be.visible')
    })
  })

  context('Persistence', function () {
    it('should persist its data', function () {
      // mimicking TodoMVC tests
      // by writing out this function
      function testState() {
        cy.get('@firstTodo').should('contain', TODO_ITEM_ONE).and('have.class', 'completed')
        cy.get('@secondTodo').should('contain', TODO_ITEM_TWO).and('not.have.class', 'completed')
      }

      cy.createTodo(TODO_ITEM_ONE).as('firstTodo')
      cy.createTodo(TODO_ITEM_TWO).as('secondTodo')
      cy.get('@firstTodo').find('.toggle').check().then(testState)
      // at this point, the app might still not save
      // the items in the local storage, for example KnockoutJS
      // first recomputes the items and still have "[]"
      checkTodosInLocalStorage(TODO_ITEM_ONE)
      checkCompletedKeywordInLocalStorage()

      // but there should be 1 completed item
      checkNumberOfCompletedTodosInLocalStorage(1)

      // now can reload
      cy.reload().then(testState)
    })
  })

  context('Routing', function () {
    beforeEach(function () {
      cy.createDefaultTodos().as('todos')
      // make sure the app had a chance to save updated todos in storage
      // before navigating to a new view, otherwise the items can get lost :(
      // in some frameworks like Durandal
      checkTodosInLocalStorage(TODO_ITEM_ONE)
    })

    it('should allow me to display active items', function () {
      cy.get('@todos').eq(1).find('.toggle').check()
      checkNumberOfCompletedTodosInLocalStorage(1)
      cy.contains(selectors.filterItems, 'Active').click()
      visibleTodos().should('have.length', 2).eq(0).should('contain', TODO_ITEM_ONE)
      visibleTodos().eq(1).should('contain', TODO_ITEM_THREE)
    })

    it('should respect the back button', function () {
      cy.get('@todos').eq(1).find('.toggle').check()
      checkNumberOfCompletedTodosInLocalStorage(1)

      cy.log('Showing all items')
      cy.contains(selectors.filterItems, 'All').click()
      visibleTodos().should('have.length', 3)

      cy.log('Showing active items')
      cy.contains(selectors.filterItems, 'Active').click()
      cy.log('Showing completed items')
      cy.contains(selectors.filterItems, 'Completed').click()
      visibleTodos().should('have.length', 1)

      cy.log('Back to active items')
      cy.go('back')
      visibleTodos().should('have.length', 2)

      cy.log('Back to all items')
      cy.go('back')
      visibleTodos().should('have.length', 3)
    })

    it('should allow me to display completed items', function () {
      visibleTodos().eq(1).find('.toggle').check()
      checkNumberOfCompletedTodosInLocalStorage(1)
      cy.get(selectors.filters).contains('Completed').click()
      visibleTodos().should('have.length', 1)
    })

    it('should allow me to display all items', function () {
      visibleTodos().eq(1).find('.toggle').check()
      checkNumberOfCompletedTodosInLocalStorage(1)
      cy.get(selectors.filters).contains('Active').click()
      cy.get(selectors.filters).contains('Completed').click()
      cy.get(selectors.filters).contains('All').click()
      visibleTodos().should('have.length', 3)
    })

    it('should highlight the currently applied filter', function () {
      cy.contains(selectors.filterItems, 'All').should('have.class', 'selected')
      cy.contains(selectors.filterItems, 'Active').click()
      // page change - active items
      cy.contains(selectors.filterItems, 'Active').should('have.class', 'selected')
      cy.contains(selectors.filterItems, 'Completed').click()
      // page change - completed items
      cy.contains(selectors.filterItems, 'Completed').should('have.class', 'selected')
    })
  })
})
