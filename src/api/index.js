import demo from './v1/demo'

const api = {
  install(Vue) {
    Vue.prototype.$api = api
  },
  demo
}

export default api
