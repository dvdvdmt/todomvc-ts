import {IView} from './i-view'
import {AppModel, ITodo} from '../app-model'
import {TodoList} from './todo-list'

interface IProps {
  model: Readonly<AppModel>
  onTodoAdd(value: string): void
  onToggleAll(checked: boolean): void
  onTodoCheck: (todo: ITodo) => void
  onTodoUncheck: (todo: ITodo) => void
}

export class AppView implements IView {
  template = `<section class='todoapp'>
  <header class='header'>
    <h1>todos</h1>
    <input class='new-todo' placeholder='What needs to be done?' autofocus>
  </header>
  <section style='display:none' class='main'>
    <input id='toggle-all' class='toggle-all' type='checkbox'>
    <label for='toggle-all'>Mark all as complete</label>
    <ul class='todo-list'></ul>
    <footer class='footer'>
      <span class='todo-count'></span>
      <ul class='filters'>
        <li>
          <a href='#/' class='selected'>All</a>
        </li>
        <li>
          <a href='#/active'>Active</a>
        </li>
        <li>
          <a href='#/completed'>Completed</a>
        </li>
      </ul>
      <button class='clear-completed'>Clear completed</button>
    </footer>
  </section>
</section>`

  el: HTMLElement
  private inputEl: HTMLInputElement
  private props: IProps
  private todoList: TodoList
  private mainEl: HTMLElement
  private todoCountEl: HTMLElement
  private toggleAllEl: HTMLInputElement

  constructor(props: IProps) {
    this.props = props
    this.el = this.createRootElement()
    this.mainEl = this.createMainElement()
    this.inputEl = this.createNewTodoInputElement()
    this.todoList = new TodoList(
      {
        items: this.props.model.todos,
        onCheck: this.props.onTodoCheck,
        onUncheck: this.props.onTodoUncheck,
      },
      {element: this.el.querySelector<HTMLElement>('.todo-list')!}
    )
    this.todoCountEl = this.el.querySelector<HTMLElement>('.todo-count')!
    this.toggleAllEl = this.createToggleAllEl()
    this.props.model.addEventListener(AppModel.todosUpdatedEvent, this.updateTodoList)
  }

  private createToggleAllEl() {
    const result = this.el.querySelector<HTMLInputElement>('.toggle-all')!
    result.addEventListener('change', () => {
      this.props.onToggleAll(result.checked)
    })
    return result
  }

  private createNewTodoInputElement() {
    const result = this.el.querySelector<HTMLInputElement>('.new-todo')!
    result.addEventListener('change', () => {
      this.props.onTodoAdd(result.value)
    })
    return result
  }

  private createRootElement() {
    const templateEl = document.createElement('template')
    templateEl.innerHTML = this.template
    return templateEl.content.cloneNode(true) as HTMLElement
  }

  render(): void {
    if (this.props.model.hasTodos) {
      this.showMainElement()
      this.todoCountEl.innerText = String(this.props.model.todoCount)
    }
    this.todoList.render()
  }

  private updateTodoList = () => {
    this.todoList.props.items = this.props.model.todos
    this.render()
  }

  clearInput() {
    this.inputEl.value = ''
  }

  private createMainElement(): HTMLElement {
    return this.el.querySelector<HTMLElement>('.main')!
  }

  private showMainElement(): void {
    this.mainEl.style.display = 'block'
  }
}
