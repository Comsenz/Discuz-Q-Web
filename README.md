# Discuz-Q-Web

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


## 部署流程

### 打包前配置

修改根目录下面的```package.json```文件，把打包命令```build```和```start```里面的```VUE_APP_CONFIG_API_URL```改成接口url,比如接口地址是```https://discuz.chat```

```javascript
  "build": "VUE_APP_CONFIG_API_URL=https://discuz.chat nuxt build",
  "start": "VUE_APP_CONFIG_API_URL=https://discuz.chat nuxt start",
```

### 安装依赖

```
npm install
```

### 运行打包命令

```
npm run build
```

### 开启服务

用```pm2```之类的进程管理工具开启一个```node```服务

```
 pm2 start npm --name "DiscuzQ" -- run start
```

## 项目目录结构说明
```
|-- api                       api 存放目录以及对于请求数据的处理存放目录
| |-- request.js              api: 请求之前或者之后处理函数
|-- assets                    资源存放目录
| |-- css                     公共样式存放目录
| | |-- variable              styles: 变量
| | | |-- color.scss          styles: 颜色
| | | |-- mixin.scss          styles: mixin函数
| | |-- reset.scss            styles: 重置页面样式
| |-- svg-icons               svg存放目录
|-- components                页面公用的组件存放的目录
|-- directive                 指令存放的目录
| |-- permission.js           按钮鉴权指令
|-- dist                      构建之后生成的目录
|-- layouts                   网站布局文件存放目录
| |-- center_layout.vue       个人中心布局文件
| |-- custom_layout.vue       首页等双列布局文件
| |-- default.vue             默认布局文件
| |-- error_layout.vue        错误页等没有头部底部布局文件
|-- library                   存放一些第三方依赖库等
|-- middleware                存放中间件文件
|-- mixin                     存放mixin文件
|-- pages                   
| |-- pages                   项目的开发目录
| |-- _.vue                   404页面
| |--index.vue                首页
|-- plugins                   插件存放目录
| |-- lang                    国际化设置目录（语言设置）
|-- static                    静态文件存放目录
|-- store                     数据状态管理目录
|-- utils                     常用函数存放目录
| |-- modules
| |-- types
|-- .editorconfig             编辑器配置推荐
|-- .eslintrc.js              eslint 配置文件
|-- .gitignore                git 提交忽略文件
|-- nuxt.config.js            nuxt 自定义配置
|-- package.json              项目配置信息，定义项目所需模块
|-- README.md                 项目说明文件


## 依赖
1. [nuxt.js](https://nuxtjs.org//)：基于vue的开发框架
2. [vue](https://cn.vuejs.org/index.html)：JavaScript 渐进式框架
3. [vuex](https://vuex.vuejs.org/zh/)：状态管理
4. [vue-i18n](https://kazupon.github.io/vue-i18n/zh/)：国际化
5. [jsonapi-vuex](https://github.com/mrichar1/jsonapi-vuex)：允许通过 vuex store 访问 [JSON:API](https://jsonapi.org/) web 服务中的数据。Discuz Q 接口使用的是 JSON:API 规范，所以使用这个库更加方便处理该请求和数据。
6. [element](https://element.eleme.cn/)：UI框架
7. [cropper](https://www.npmjs.com/package/cropperjs)：图片裁剪插件
8. [v-viewer](https://github.com/mirari/v-viewer)：图片点击放大预览插件