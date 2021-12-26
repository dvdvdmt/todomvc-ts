import {AppModel, ITodo} from './app-model'
import {AppView} from './view/app-view'

export class AppController {
  private model: AppModel
  private view: AppView

  constructor() {
    this.model = new AppModel()
    this.view = new AppView({
      model: this.model,
      onClearCompleted: this.onClearCompleted,
      onToggleAll: this.onToggleAll,
      onTodoAdd: this.onTodoAdd,
      onTodoCheck: this.onTodoCheck,
      onTodoUncheck: this.onTodoUncheck,
      onTodoEdit: this.onTodoEdit,
      onTodoDelete: this.onTodoDelete,
    })
    document.body.appendChild(this.view.el)
    this.view.render()
  }

  private onTodoAdd = (value: string) => {
    this.model.add(value.trim())
    this.view.clearInput()
  }

  private onToggleAll = (checked: boolean) => {
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

  private onTodoEdit = (todo: ITodo) => {
    this.model.update(todo)
  }

  private onTodoDelete = (todo: ITodo) => {
    this.model.delete(todo)
  }

  private onClearCompleted() {
    this.model.deleteCompleted()
  }
}
