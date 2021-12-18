import {IView} from './i-view'
import {AppModel} from '../app-model'

interface IProps {
  model: Readonly<AppModel>
  onTodoAdd(value: string): void
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

  constructor(props: IProps) {
    this.props = props
    this.el = this.createRootElement()
    this.inputEl = this.createNewTodoInputElement()
    this.props.model.addEventListener(AppModel.todosUpdatedEvent, this.renderTodoList)
  }

  private createNewTodoInputElement() {
    const result = this.el.querySelector<HTMLInputElement>('.new-todo')!
    result.addEventListener('change', () => {
      this.props.onTodoAdd(this.inputEl.value)
    })
    return result
  }

  private createRootElement() {
    const templateEl = document.createElement('template')
    templateEl.innerHTML = this.template
    return templateEl.content.cloneNode(true) as HTMLElement
  }

  render(): void {}

  private renderTodoList = () => {
    console.log(`[renderTodoList this.props.model.todos]`, this.props.model.todos)
  }

  clearInput() {
    this.inputEl.value = ''
  }
}
