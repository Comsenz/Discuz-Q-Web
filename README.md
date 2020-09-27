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