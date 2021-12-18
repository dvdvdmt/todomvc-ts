import {AppModel} from './app-model'
import {AppView} from './view/app-view'

export class AppController {
  private model: AppModel
  private view: AppView

  constructor() {
    this.model = new AppModel()
    this.view = new AppView({model: this.model, onTodoAdd: this.addTodo})
    document.body.appendChild(this.view.el)
    this.view.render()
  }

  addTodo = (value: string) => {
    this.model.add(value)
    this.view.clearInput()
  }
}
