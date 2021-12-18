import {IView} from './i-view'

interface ITodoItem {
  id: number
  completed: boolean
  title: string
}

interface IProps {
  items: ITodoItem[]
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
    const items = this.props.items.map((item) => this.createListItemElement(item))
    this.el.append(...items)
  }

  createListItemElement(item: ITodoItem): HTMLElement {
    const result = document.createElement('li')
    result.dataset.dataId = String(item.id)
    if (item.completed) {
      result.classList.add('completed')
    }
    result.innerHTML = `<div class='view'>
  <input class='toggle' type='checkbox' ${item.completed ? 'checked' : ''}>
  <label>${item.title}</label>
  <button class='destroy'></button>
</div>`
    return result
  }
}
