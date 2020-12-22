// 长列表优化
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import Vue from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

Vue.component('DynamicScroller', DynamicScroller);
Vue.component('DynamicScrollerItem', DynamicScrollerItem);
