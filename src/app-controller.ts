import {AppModel, ITodo} from './app-model'
import {AppView} from './view/app-view'

export class AppController {
  private model: AppModel
  private view: AppView

  constructor() {
    this.model = new AppModel()
    this.view = new AppView({
      model: this.model,
      onTodoAdd: this.addTodo,
      onToggleAll: this.toggleAll,
      onTodoCheck: this.onTodoCheck,
      onTodoUncheck: this.onTodoUncheck,
    })
    document.body.appendChild(this.view.el)
    this.view.render()
  }

  private addTodo = (value: string) => {
    this.model.add(value.trim())
    this.view.clearInput()
  }

  private toggleAll = (checked: boolean) => {
    if (checked) {
      this.model.markAllComplete()
    } else {
      this.model.markAllIncomplete()
    }
  }

  private onTodoCheck = (todo: ITodo) => {
    this.model.markComplete(todo)
  }

  private onTodoUncheck = (todo: ITodo) => {
    this.model.markIncomplete(todo)
  }
}
