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
  Container,
  Collapse,
  CollapseItem,
  Popover,
  DatePicker,
  Select,
  Option,
  Table,
  TableColumn,
  Pagination,
  InfiniteScroll,
  Upload,
  Progress,
  Badge,
  RadioGroup,
  Radio,
  Switch,
  Backtop
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
Vue.use(Collapse, { locale })
Vue.use(CollapseItem, { locale })
Vue.use(Popover, { locale })
Vue.use(DatePicker, { locale })
Vue.use(Select, { locale })
Vue.use(Option, { locale })
Vue.use(Table, { locale })
Vue.use(TableColumn, { locale })
Vue.use(Pagination, { locale })
Vue.use(InfiniteScroll, { locale })
Vue.use(Upload, { locale })
Vue.use(Progress, { locale })
Vue.use(Badge, { locale })
Vue.use(RadioGroup, { locale })
Vue.use(Radio, { locale })
Vue.use(Switch, { locale })
Vue.use(Backtop, { locale })

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
