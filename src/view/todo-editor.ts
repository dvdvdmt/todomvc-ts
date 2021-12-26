import {TodoItem} from './todo-item'
import {ITodo} from '../app-model'

interface IProps {
  onChange(todo: ITodo): void
}

export class TodoEditor {
  private props: IProps
  private editingTodo?: TodoItem
  el: HTMLInputElement

  constructor(props: IProps) {
    this.props = props
    this.el = this.createEditorElement()
  }

  close() {
    if (this.editingTodo) {
      this.editingTodo.el.classList.remove('editing')
      if (this.el.parentElement === this.editingTodo.el) {
        this.editingTodo.el.removeChild(this.el)
      }
    }
  }

  open(todo: TodoItem) {
    this.close()
    this.editingTodo = todo
    this.editingTodo.el.classList.add('editing')
    this.editingTodo.el.append(this.el)
    this.el.value = this.editingTodo.props.todo.title
    this.el.focus()
  }

  private createEditorElement(): HTMLInputElement {
    const result = document.createElement('input')
    result.className = 'edit'
    result.addEventListener('change', () => {
      this.props.onChange({...this.editingTodo!.props.todo, title: this.el.value})
      this.close()
    })
    result.addEventListener('blur', () => {
      this.close()
    })
    return result
  }
}
