export interface ITodo {
  id: number
  completed: boolean
  title: string
}

export const enum TodoFilter {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

export class AppModel extends EventTarget {
  static readonly updatedEvent = 'updatedEvent'
  static readonly storageKey = 'todos'
  todos: ITodo[]
  filter: TodoFilter

  constructor() {
    super()
    this.todos = AppModel.getTodosFromStorage()
    this.filter = AppModel.getFilterFromUrl()
    window.addEventListener('popstate', this.onAddressChange)
  }

  get isAllComplete(): boolean {
    return this.hasTodos && this.todos.every((value) => value.completed)
  }

  get todoCount(): number {
    return this.todos.length
  }

  get hasTodos(): boolean {
    return this.todoCount > 0
  }

  get hasCompleted(): boolean {
    return this.todos.some((todo) => todo.completed)
  }

  get filteredTodos(): ITodo[] {
    if (this.filter === TodoFilter.Active) {
      return this.todos.filter(({completed}) => !completed)
    }
    if (this.filter === TodoFilter.Completed) {
      return this.todos.filter(({completed}) => completed)
    }
    return this.todos
  }

  static getFilterFromUrl(): TodoFilter {
    const hash = window.location.hash
    if (hash.includes(TodoFilter.Active)) {
      return TodoFilter.Active
    }
    if (hash.includes(TodoFilter.Completed)) {
      return TodoFilter.Completed
    }
    return TodoFilter.All
  }

  static getTodosFromStorage(): ITodo[] {
    const json = localStorage.getItem(AppModel.storageKey)
    if (!json) {
      return []
    }
    let result
    try {
      result = JSON.parse(json)
    } catch (e) {
      return []
    }
    if (!Array.isArray(result)) {
      return []
    }
    return result
  }

  add(title: string): void {
    this.todos.push({id: this.todos.length, completed: false, title})
    this.save()
  }

  markAllComplete() {
    this.todos.forEach((todo) => {
      todo.completed = true
    })
    this.save()
  }

  markAllIncomplete() {
    this.todos.forEach((todo) => {
      todo.completed = false
    })
    this.save()
  }

  markComplete(todo: ITodo) {
    const target = this.getById(todo.id)
    if (target) {
      target.completed = true
      this.save()
    }
  }

  markIncomplete(todo: ITodo) {
    const target = this.getById(todo.id)
    if (target) {
      target.completed = false
      this.save()
    }
  }

  update(todo: ITodo) {
    const target = this.getById(todo.id)
    if (target) {
      Object.assign(target, todo)
      this.save()
    }
  }

  delete(todo: ITodo) {
    this.todos = this.todos.filter(({id}) => id !== todo.id)
    this.save()
  }

  deleteCompleted() {
    this.todos = this.todos.filter(({completed}) => !completed)
    this.save()
  }

  private save() {
    window.localStorage.setItem(AppModel.storageKey, JSON.stringify(this.todos))
    this.notify()
  }

  private getById(id: number): ITodo | undefined {
    return this.todos.find((todo) => todo.id === id)
  }

  private onAddressChange = () => {
    this.filter = AppModel.getFilterFromUrl()
    this.notify()
  }

  private notify() {
    this.dispatchEvent(new Event(AppModel.updatedEvent))
  }
}
