import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = process.env.NODE_ENV !== 'production'

import './plugins/element-ui'

// 全局样式
import './assets/sass/main.scss'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
