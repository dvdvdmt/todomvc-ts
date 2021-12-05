import {AppController} from './app-controller'

if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload()
  })
}

new AppController()
