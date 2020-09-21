// import store from '@/store'
import Vue from 'vue'
import { Message } from 'element-ui'
/**
 * 自定义指令，检测用户是否有登录态
 * 使用： <a v-permission:fn="arg"></a>
 *
 * @param {点击要执行的函数} fn
 * @param {参数，可以为空} arg
 *
 * !!!!!!!!注意一个问题，目标元素不能用v-if指令，如果需要，请用v-show代替，原因是用v-if是移除添加DOM元素，会产生多次事件绑定！！！！！！！！
 * 后来发现，这个指令，它的父级用v-if也会有莫名其妙的事件多重绑定，最好的方案是用事件捕获，要是没登录
 * 就直接不让事件传递下去就好了
 */
function callback(binding, vnode) {
  return () => {
    let token = ''
    if (process.client && localStorage.getItem('access_token')) {
      token = localStorage.getItem('access_token')
    }
    if (!token) {
      // store.commit('login/SHOW_LOGIN')
      // 后期再处理
      if (process.client) {
        Message.error('请登录后再操作')
        location.href = '/user/login'
      } else {
        console.log('请登录后再操作')
      }
    } else {
      const that = vnode.context
      that[binding.arg](binding.value)
    }
  }
}
Vue.directive('permission', {
  bind: (el, binding, vnode) => {
    // el.removeEventListener('click', callback(binding, vnode), false)
    el.addEventListener('click', callback(binding, vnode), false)
  }
})
