import Vue from 'vue'
// import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

import {
  Button,
  Input,
  Message,
  Tabs,
  TabPane,
  Checkbox
} from 'element-ui'

Vue.use(Button, { locale })
Vue.use(Input, { locale })
Vue.use(Tabs, { locale })
Vue.use(TabPane, { locale })
Vue.use(Checkbox, { locale })
Vue.prototype.$message = Message;
