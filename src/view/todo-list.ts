import {IView} from './i-view'
import {ITodo} from '../app-model'
import {TodoItem} from './todo-item'

interface IProps {
  items: ITodo[]
  onCheck(todo: ITodo): void
  onUncheck(todo: ITodo): void
}

interface IOptions {
  element: HTMLElement
}

export class TodoList implements IView {
  constructor(props: IProps, options: IOptions) {
    this.props = props
    this.el = options.element
  }

  el: HTMLElement
  props: IProps

  render(): void {
    this.el.innerHTML = ''
    this.props.items.forEach((item) => {
      const itemView = new TodoItem({
        todo: item,
        onCheck: this.props.onCheck,
        onUncheck: this.props.onUncheck,
      })
      itemView.render()
      this.el.append(itemView.el)
    })
  }
}
