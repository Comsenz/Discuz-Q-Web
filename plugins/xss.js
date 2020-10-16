import xss from 'xss'
import Vue from 'vue'

xss.whiteList.img = ['src', 'alt', 'title', 'width', 'height', 'class']
xss.whiteList.button = ['class']

Vue.prototype.$xss = xss // 给vue原型加上
