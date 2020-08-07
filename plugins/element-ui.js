import Vue from 'vue'
// import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

import {
  Button,
  Input,
  Image,
  Message
} from 'element-ui'

Vue.use(Button, { locale })
Vue.use(Input, { locale })
Vue.use(Image, { locale })
Vue.prototype.$message = Message;
