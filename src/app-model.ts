export interface ITodo {
  id: number
  completed: boolean
  title: string
}

export class AppModel extends EventTarget {
  static readonly todosUpdatedEvent = 'todosUpdatedEvent'
  todos: ITodo[]
  private readonly storageKey: string

  constructor() {
    super()
    this.storageKey = 'todos'
    this.todos = []
  }

  get todoCount(): number {
    return this.todos.length
  }

  get hasTodos(): boolean {
    return this.todoCount > 0
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
