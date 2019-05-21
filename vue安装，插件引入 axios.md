# vue-study

标签（空格分隔）： vue

---
## 安装
npm安装
`npm install vue`
直接引入
`<script src="https://cdn.jsdelivr.net/npm/vue"></script>`

`vue init webpack mydemo`

切换到项目目录
`cd mydemo`

安装模块
`npm install`
　　它根据package.json的配置表进行安装，安装完后会在mydemo下多一个文件夹node_modules，这里的文件对应着package.json里的配置信息。
　　
输入命令
`npm run dev `
　　在浏览器输入地址http://localhost:8080，看到如下页面，说明大功告成，一个Vue项目已经初始化完成！
　　
使用element-ui
`npm i element-ui -S`

完整引入
在 main.js 中写入以下内容：
```
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

## 安装Vue Devtools调试工具

- 在github下载devtools源码
`https://github.com/vuejs/vue-devtools`

- 在vue-devtools-master工程中执行命令
    执行`cnpm install`，下载依赖
- 执行`npm run build`，编译源程序

- 编译完成后修改数据
修改shells >chrome目录下的mainifest.json 中的persistant为true

- 设置谷歌浏览器的扩展程序
勾选开发者模式，然后将刚刚编译后的工程中的shells目录下，chrome的整个文件夹直接拖拽到当前浏览器中，并选择启用，即可将插件安装到浏览器。


## 引入全局函数

新建common.js文件

```
var fun = function () {
  console.log('hello')
}
export default fun
```
在main.js中引入
`import fun from '@/js/common.js'`
`Vue.prototype.$pubFuc = fun `

## 关闭elint
在配置文件中，注释掉规则
```
const createLintingRule = () => ({
  // test: /\.(js|vue)$/,
  // loader: 'eslint-loader',
  // enforce: 'pre',
  // include: [resolve('src'), resolve('test')],
  // options: {
  //   formatter: require('eslint-friendly-formatter'),
  //   emitWarning: !config.dev.showEslintErrorsInOverlay
  // }
})
```
## axios

`npm install axios`

Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。

vue中使用axios
1.安装axios

npm：

$ npm install axios -S
cdn：

<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
2.配置axios

在项目中新建api/index.js文件，用以配置axios

api/index.js

```
import axios from 'axios';

let http = axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  },
  transformRequest: [function (data) {
    let newData = '';
    for (let k in data) {
      if (data.hasOwnProperty(k) === true) {
        newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
      }
    }
    return newData;
  }]
});

function apiAxios(method, url, params, response) {
  http({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
  }).then(function (res) {
    response(res);
  }).catch(function (err) {
    response(err);
  })
}

export default {
  get: function (url, params, response) {
    return apiAxios('GET', url, params, response)
  },
  post: function (url, params, response) {
    return apiAxios('POST', url, params, response)
  },
  put: function (url, params, response) {
    return apiAxios('PUT', url, params, response)
  },
  delete: function (url, params, response) {
    return apiAxios('DELETE', url, params, response)
  }
}
```

这里的配置了POST、GET、PUT、DELETE方法。并且自动将JSON格式数据转为URL拼接的方式

同时配置了跨域，不需要的话将withCredentials设置为false即可

并且设置了默认头部地址为：http://localhost:8080/，这样调用的时候只需写访问方法即可

3.使用axios

注：PUT请求默认会发送两次请求，第一次预检请求不含参数，所以后端不能对PUT请求地址做参数限制

首先在main.js中引入方法
```
import Api from './api/index.js';
Vue.prototype.$api = Api;
```
然后在需要的地方调用即可

```
this.$api.post('user/login.do(地址)', {
    "参数名": "参数值"
}, response => {
     if (response.status >= 200 && response.status < 300) {
        console.log(response.data);\\请求成功，response为成功信息参数
     } else {
        console.log(response.message);\\请求失败，response为失败信息
     }
});
```






















