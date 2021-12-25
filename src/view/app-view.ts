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
  private main: IView
  private todoCount: IView
  private toggleAllEl: HTMLInputElement

  constructor(props: IProps) {
    this.props = props
    this.el = this.createRootElement()
    this.main = this.createMain()
    this.inputEl = this.createNewTodoInputElement()
    this.todoList = new TodoList(
      {
        items: this.props.model.todos,
        onCheck: this.props.onTodoCheck,
        onUncheck: this.props.onTodoUncheck,
      },
      {element: this.el.querySelector<HTMLElement>('.todo-list')!}
    )
    this.todoCount = this.createTodoCount()
    this.toggleAllEl = this.createToggleAllEl()
    this.props.model.addEventListener(AppModel.updatedEvent, this.onModelUpdated)
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
    this.todoCount.render()
    this.main.render()
    this.todoList.render()
  }

  private onModelUpdated = () => {
    this.todoList.props.items = this.props.model.todos
    this.render()
  }

  clearInput() {
    this.inputEl.value = ''
  }

  private createMain() {
    const props = this.props
    return {
      el: this.el.querySelector<HTMLElement>('.main')!,
      render() {
        if (props.model.hasTodos) {
          this.el.style.display = 'block'
        } else {
          this.el.style.display = 'none'
        }
      },
    }
  }

  private createTodoCount() {
    const props = this.props
    return {
      el: this.el.querySelector<HTMLElement>('.todo-count')!,
      render() {
        this.el.innerText = String(props.model.todoCount)
      },
    }
  }
}
