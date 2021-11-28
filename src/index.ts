import {App} from './view/app'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

const appView = new App()
document.body.appendChild(appView.el)
