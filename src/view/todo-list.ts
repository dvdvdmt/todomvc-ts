import {IView} from './i-view'
import {ITodo} from '../app-model'
import {TodoItem} from './todo-item'
import {TodoEditor} from './todo-editor'

interface IProps {
  items: ITodo[]
  onCheck(todo: ITodo): void
  onUncheck(todo: ITodo): void
}

interface IOptions {
  element: HTMLElement
  editor: TodoEditor
}

export class TodoList implements IView {
  el: HTMLElement
  props: IProps
  private editor: TodoEditor

  constructor(props: IProps, options: IOptions) {
    this.props = props
    this.el = options.element
    this.editor = options.editor
  }

  render(): void {
    this.el.innerHTML = ''
    this.props.items.forEach((item) => {
      const itemView = new TodoItem({
        todo: item,
        editor: this.editor,
        onCheck: this.props.onCheck,
        onUncheck: this.props.onUncheck,
      })
      itemView.render()
      this.el.append(itemView.el)
    })
  }
}
