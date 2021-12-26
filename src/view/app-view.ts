import {IView} from './i-view'
import {AppModel, ITodo} from '../app-model'
import {TodoList} from './todo-list'
import {TodoEditor} from './todo-editor'

interface IProps {
  model: Readonly<AppModel>
  onClearCompleted(): void
  onTodoAdd(value: string): void
  onToggleAll(checked: boolean): void
  onTodoCheck(todo: ITodo): void
  onTodoUncheck(todo: ITodo): void
  onTodoEdit(todo: ITodo): void
  onTodoDelete(todo: ITodo): void
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
  private toggleAll: IView
  private todoEditor: TodoEditor
  private clearCompletedEl: HTMLElement

  constructor(props: IProps) {
    this.props = props
    this.todoEditor = new TodoEditor({
      onChange: this.onTodoChange,
    })
    this.el = this.createRootElement()
    this.main = this.createMain()
    this.inputEl = this.createNewTodoInputElement()
    this.todoList = new TodoList(
      {
        items: this.props.model.todos,
        onCheck: this.props.onTodoCheck,
        onUncheck: this.props.onTodoUncheck,
      },
      {element: this.el.querySelector<HTMLElement>('.todo-list')!, editor: this.todoEditor}
    )
    this.todoCount = this.createTodoCount()
    this.toggleAll = this.createToggleAll()
    this.clearCompletedEl = this.createClearCompleted()
    this.props.model.addEventListener(AppModel.updatedEvent, this.onModelUpdated)
  }

  createClearCompleted(): HTMLElement {
    const result = this.el.querySelector<HTMLElement>('.clear-completed')!
    result.addEventListener('click', () => {
      this.props.onClearCompleted()
    })
    return result
  }

  private createToggleAll() {
    const props = this.props
    const el = this.el.querySelector<HTMLInputElement>('.toggle-all')!
    el.addEventListener('change', () => {
      this.props.onToggleAll(el.checked)
    })
    return {
      el,
      render() {
        this.el.checked = props.model.isAllComplete
      },
    }
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
    this.toggleAll.render()
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

  private onTodoChange = (todo: ITodo) => {
    if (todo.title) {
      this.props.onTodoEdit(todo)
    } else {
      this.props.onTodoDelete(todo)
    }
  }
}
