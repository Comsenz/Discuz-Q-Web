import xss from 'xss'
import Vue from 'vue'
// 自定义白名单
xss.whiteList.img = ['src', 'alt', 'title', 'width', 'height', 'class']
xss.whiteList.button = ['class']
xss.whiteList.input = ['data-task-id', 'type', 'disabled']
xss.whiteList.ul = ['class']
xss.whiteList.li = ['class', 'data-task-state']

Vue.prototype.$xss = xss // 给vue原型加上
