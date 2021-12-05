interface ITodo {
  id: number
  completed: boolean
  title: string
}

export class AppModel extends EventTarget {
  static readonly todosUpdatedEvent = 'todosUpdatedEvent'
  private readonly storageKey: string
  todos: ITodo[]

  constructor() {
    super()
    this.storageKey = 'todos'
    this.todos = []
  }

  add(title: string): void {
    this.todos.push({id: this.todos.length, completed: false, title})
    this.save()
  }

  private save() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.todos))
    this.dispatchEvent(new Event(AppModel.todosUpdatedEvent))
  }
}
