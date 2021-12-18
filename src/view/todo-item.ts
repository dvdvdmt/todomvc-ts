import {IView} from './i-view'
import {ITodo} from '../app-model'

interface IProps {
  todo: ITodo
}

export class TodoItem implements IView {
  el: HTMLElement
  private props: IProps
  private checkboxEl: HTMLInputElement
  private labelEl: HTMLLabelElement
  private buttonEl: HTMLButtonElement

  constructor(props: IProps) {
    this.props = props
    this.el = document.createElement('li')
    this.checkboxEl = this.createCheckboxElement()
    this.labelEl = document.createElement('label')
    this.buttonEl = this.createButtonElement()
    this.el.append(this.checkboxEl, this.labelEl, this.buttonEl)
  }

  render(): void {
    this.el.dataset.dataId = String(this.props.todo.id)
    if (this.props.todo.completed) {
      this.el.classList.add('completed')
      this.checkboxEl.checked = true
    }
    this.labelEl.innerText = this.props.todo.title
  }

  private createCheckboxElement(): HTMLInputElement {
    const result = document.createElement('input')
    result.classList.add('toggle')
    result.type = 'checkbox'
    return result
  }

  private createButtonElement(): HTMLButtonElement {
    const result = document.createElement('button')
    result.className = 'destroy'
    return result
  }
}
