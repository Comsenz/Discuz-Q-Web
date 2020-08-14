import Vue from 'vue'
// import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

import {
  Button,
  Input,
  Image,
  Message,
  MessageBox,
  Tabs,
  TabPane,
  Checkbox,
  Loading,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Dialog,
  Menu,
  MenuItem,
  Submenu,
  Container
} from 'element-ui'

Vue.use(Button, { locale })
Vue.use(Input, { locale })
Vue.use(Image, { locale })
Vue.use(Tabs, { locale })
Vue.use(TabPane, { locale })
Vue.use(Checkbox, { locale })
Vue.use(Loading, { locale })
Vue.use(Dropdown, { locale })
Vue.use(DropdownMenu, { locale })
Vue.use(DropdownItem, { locale })
Vue.use(Dialog, { locale })
Vue.use(Menu, { locale })
Vue.use(MenuItem, { locale })
Vue.use(Submenu, { locale })
Vue.use(Container, { locale })

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
