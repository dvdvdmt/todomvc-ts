import {IView} from './i-view'
import {ITodo} from '../app-model'
import {TodoEditor} from './todo-editor'

interface IProps {
  editor: TodoEditor
  todo: ITodo
  onCheck(todo: ITodo): void
  onUncheck(todo: ITodo): void
  onDelete(todo: ITodo): void
}

export class TodoItem implements IView {
  el: HTMLElement
  props: IProps
  private checkboxEl: HTMLInputElement
  private labelEl: HTMLLabelElement
  private buttonEl: HTMLButtonElement
  private viewEl: HTMLElement

  constructor(props: IProps) {
    this.props = props
    this.el = document.createElement('li')
    this.viewEl = this.createViewElement()
    this.checkboxEl = this.createCheckboxElement()
    this.labelEl = this.createLabelElement()
    this.buttonEl = this.createDeleteButtonElement()
    this.viewEl.append(this.checkboxEl, this.labelEl, this.buttonEl)
    this.el.append(this.viewEl)
  }

  private createLabelElement() {
    const result = document.createElement('label')
    result.addEventListener('dblclick', () => {
      this.props.editor.open(this)
    })
    return result
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
    result.addEventListener('change', () => {
      if (result.checked) {
        this.props.onCheck(this.props.todo)
      } else {
        this.props.onUncheck(this.props.todo)
      }
    })
    return result
  }

  private createDeleteButtonElement(): HTMLButtonElement {
    const result = document.createElement('button')
    result.className = 'destroy'
    result.addEventListener('click', () => {
      this.props.onDelete(this.props.todo)
    })
    return result
  }

  private createViewElement(): HTMLElement {
    const result = document.createElement('div')
    result.className = 'view'
    return result
  }
}
