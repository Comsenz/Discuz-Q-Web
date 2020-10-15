import xss from 'xss'
import Vue from 'vue'
Vue.prototype.$xss = xss // 给vue原型加上
