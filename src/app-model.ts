export interface ITodo {
  id: number
  completed: boolean
  title: string
}

export class AppModel extends EventTarget {
  static readonly updatedEvent = 'updatedEvent'
  todos: ITodo[]
  private readonly storageKey: string

  constructor() {
    super()
    this.storageKey = 'todos'
    this.todos = []
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

  private save() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.todos))
    this.dispatchEvent(new Event(AppModel.updatedEvent))
  }

  markComplete(todo: ITodo) {
    const target = this.getById(todo.id)
    if (target) {
      target.completed = true
      this.save()
    }
  }

  private getById(id: number): ITodo | undefined {
    return this.todos.find((todo) => todo.id === id)
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
}
