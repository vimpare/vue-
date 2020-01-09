##### SSR的原理
![SSR的原理](https://upload-images.jianshu.io/upload_images/4954358-c9d9485e8428cafd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


左侧Source部分就是源代码，所有代码有一个公共入口，就是app.js，紧接着就是服务端的入口
（entry-server.js）和客户端的入口（entry-client.js）。
当完成所有源代码的编写之后，我们通过webpack的构建，打包出两个bundle，分别是server bundle和client bundle；
当用户进行页面访问的时候，先是经过服务端的入口，将vue组建组装为html字符串，并混入客户端所访问的html模板中，最终就完成了整个ssr渲染的过程。

##### Vue项目的开发目录
![Vue项目的开发目录](https://upload-images.jianshu.io/upload_images/4954358-c3852ddde7ed1bd2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###### 路由
`npm install vue-router`

修改router/index.js
```
const vueRouter = require("vue-router");
const Vue = require("vue");

Vue.use(vueRouter);

module.exports = () => {
    return new vueRouter({
        mode:"history",
        routes:[
            {
                path:"/",
                component:{
                    template:`<h1>this is home page</h1>`
                },
                name:"home"
            },
            {
                path:"/about",
                component:{
                    template:`<h1>this is about page</h1>`
                },
                name:"about"
            }
        ]
    })
}
```

修改app.js

app.js 是我们应用程序的「通用 entry」。在纯客户端应用程序中，我们将在此文件中创建根 Vue 实例，并直接挂载到 DOM。但是，对于服务器端渲染(SSR)，责任转移到纯客户端 entry 文件。app.js 简单地使用 export 导出一个 createApp 函数：
```
const Vue = require("vue");
const createRouter = require("./router")

module.exports = (context) => {
    const router = createRouter();
    return new Vue({
        router,
        data:{
            message:"Hello,Vue SSR!",
        },
        template:`
            <div>
                <h1>{{message}}</h1>
                <ul>
                    <li>
                        <router-link to="/">home</router-link>
                    </li>
                    <li>
                        <router-link to="/about">about</router-link>
                    </li>
                </ul>
                <router-view></router-view>
            </div>
        ` 
    });
}
```

在index.js中，将app.js引入
```
const express = require("express");
const app = express();
const vueApp = require('./src/app.js');

let path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
    template:require("fs").readFileSync(path.join(__dirname,"./index.template.html"),"utf-8")
});

app.get('*', (request, response) => {
    let vm = vueApp({});

    response.status(200);
    response.setHeader("Content-type", "text/html;charset-utf-8");

    vueServerRender.renderToString(vm).then((html) => {
        response.end(html);
    }).catch(err => console.log(err))
})

app.listen(8080, () => {
    console.log('服务已开启')
})
```

重启之后发现点击路由链接，页面没有变化，===>需要服务端控制页面路由


在src中创建一个entry-server.js文件，该文件为服务端入口文件
```
const createApp = require("./app.js");

module.exports = (context) => {
     // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，
    // 就已经准备就绪。
    return new Promise(async (reslove,reject) => {
        let {url} = context;

        let {app,router} = createApp(context);
        // 设置服务器端 router 的位置
        router.push(url);
        //  router回调函数
        
        // 等到 router 将可能的异步组件和钩子函数解析完
        router.onReady(() => {
            let matchedComponents = router.getMatchedComponents();
          // 匹配不到的路由，执行 reject 函数
            if(!matchedComponents.length){
                return reject();
            }
            // Promise 应该 resolve 应用程序实例，以便它可以渲染
            reslove(app);
        },reject)
    })
}
```
在src中创建一个entry-client.js文件，该文件为客户端入口
客户端 entry 只需创建应用程序，并且将其挂载到 DOM 中：
```
const createApp = require("./app.js");
let {app,router} = createApp({});

router.onReady(() => {
    app.$mount("#app")
});
```
修改app.js

const Vue = require("vue");
const createRouter = require("./router")

module.exports = (context) => {
    const router = createRouter();
    const app =  new Vue({
        router,
        data:{
            message:"Hello,Vue SSR!",
        },
        template:`
            <div>
                <h1>{{message}}</h1>
                <ul>
                    <li>
                        <router-link to="/">home</router-link>
                    </li>
                    <li>
                        <router-link to="/about">about</router-link>
                    </li>
                </ul>
                <router-view></router-view>
            </div>
        ` 
    });
    return {
        app,
        router
    }
}
```
最终修改index.js

const express = require("express");
const app = express();

const App = require('./src/entry-server.js');

let path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
    template:require("fs").readFileSync(path.join(__dirname,"./index.template.html"),"utf-8")
});

app.get('*', async(request, response) => {

    response.status(200);
    response.setHeader("Content-type", "text/html;charset-utf-8");

    let {url} = request;
    let vm;
    vm = await App({url})
    vueServerRender.renderToString(vm).then((html) => {
        response.end(html);
    }).catch(err => console.log(err))
})

app.listen(8080)
```
怎样才能把服务端接收到的数据传输给前端?
修改entry-server.js，进行同步或者异步获取数据

```
const createApp = require("./app.js");

const getData = function(){
    return new Promise((reslove, reject) => {
        let str = 'this is a async data!';
        reslove(str);
    })
}

module.exports = (context) => {
    return new Promise(async (reslove,reject) => {
        let {url} = context;

        // 数据传递
        context.propsData = 'this is a data from props!'

        context.asyncData = await getData();

        let {app,router} = createApp(context);
        router.push(url);
        //  router回调函数
        //  当所有异步请求完成之后就会触发
        router.onReady(() => {
            let matchedComponents = router.getMatchedComponents();
            if(!matchedComponents.length){
                return reject();
            }
            reslove(app);
        },reject)
    })
}

```
修改app.js，接收数据并渲染

```


const Vue = require("vue");
const createRouter = require("./router")

module.exports = (context) => {
    const router = createRouter();
    const app =  new Vue({
        router,
        data:{
            message:"Hello,Vue SSR!",
            propsData: context.propsData,
            asyncData: context.asyncData
        },
        template:`
            <div>
                <h1>{{message}}</h1>
                <p>{{asyncData}}</p>
                <p>{{propsData}}</p>
                <ul>
                    <li>
                        <router-link to="/">home</router-link>
                    </li>
                    <li>
                        <router-link to="/about">about</router-link>
                    </li>
                </ul>
                <router-view></router-view>
            </div>
        ` 
    });
    return {
        app,
        router
    }
}
```
![413451DE-5925-4f8c-96F2-87D1EFA1FA6E.png](https://upload-images.jianshu.io/upload_images/4954358-68ed023592f81b9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
