#### [Vue SSR](https://ssr.vuejs.org/zh/)
##### 服务器端渲染
Vue.js 可以将同一个组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记"激活"为客户端上完全可交互的应用程序

#### 为什么使用服务器端渲染 (SSR)？
* 更好的 SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面
* 更快的内容到达时间 (time-to-content)

#### 需权衡之处：

* 开发条件所限。浏览器特定的代码，只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些外部扩展库 (external library) 可能需要特殊处理，才能在服务器渲染应用程序中运行。

* 涉及构建设置和部署的更多要求。与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 **Node.js server** 运行环境。

* 更多的服务器端负载。在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境 (high traffic) 下使用，请准备相应的服务器负载，并明智地采用缓存策略。

#### 基本用法
###### 渲染一个 Vue 实例
1    `npm init`
新建一个项目
2    `npm install vue vue-server-renderer --save`
新建index.js
```
// 第 1 步：创建一个 Vue 实例
const Vue=require('vue');

const app=new Vue({
    template:`<div>Hello</div>`
})
// 第 2 步：创建一个 renderer
const renderer=require('vue-server-renderer').createRenderer();
// 第 3 步：将 Vue 实例渲染为 HTML
renderer.renderToString(app,(err,html)=>{
    if(err){
        throw err
    }
    console.log(html)
})
// 在 2.5.0+，如果没有传入回调函数，则会返回 Promise：
renderer.renderToString(app).then(html=>{
    console.log(html)
}).catch(err => {
    console.error(err)
  })
```

在终端`node index.js`运行出现`<div>Hello</div>`


###### 与服务器集成
1   `npm install express --save`
将index.js改写
```
const Vue=require('vue');
const server = require('express')()

const renderer=require('vue-server-renderer').createRenderer();

server.get('*',(req,res)=>{
    const app=new Vue({
        data: {
            url: req.url
          },
        template:`<div>访问的 URL 是： {{ url }}</div>`
    })

    renderer.renderToString(app,(err,html)=>{
        if(err){
            res.status(500).end('Internal Server Error')
            return
        }
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
                <head><title>Hello</title></head>
                <body>${html}</body>
            </html>
            `)
    })
})


// renderer.renderToString(app).then(html=>{
//     console.log(html)
// }).catch(err => {
//     console.error(err)
//   })
server.listen(8080)
```
在浏览器打开localhost:8080 出现页面

###### 使用一个页面模板
用一个额外的 HTML 页面包裹容器，来包裹生成的 HTML 标记
=====》直接在创建 renderer 时提供一个页面模板

多数时候，我们会将页面模板放在特有的文件中，例如 `index.template.html`
```
<!DOCTYPE html>
<html lang="en">
  <head><title>Hello</title></head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```

注意 
```
<!--vue-ssr-outlet-->
```
 注释 -- 这里将是应用程序 HTML 标记注入的地方。

继续将index.js改写：
```
const Vue=require('vue');
const server = require('express')()


const renderer=require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
});


server.get('*',(req,res)=>{
    const app=new Vue({
        data: {
            url: req.url
          },
        template:`<div>访问的 URL 是： {{ url }}</div>`
    })

    renderer.renderToString(app,(err,html)=>{
        if(err){
            res.status(500).end('Internal Server Error')
            return
        }
        res.end(html) //html 将是注入应用程序内容的完整页面
    })
})


// renderer.renderToString(app).then(html=>{
//     console.log(html)
// }).catch(err => {
//     console.error(err)
//   })
server.listen(8080)
```

###### 模板插值
如下模板：
```
<html>
  <head>
    <!-- 使用双花括号(double-mustache)进行 HTML 转义插值(HTML-escaped interpolation) -->
    <title>{{ title }}</title>

    <!-- 使用三花括号(triple-mustache)进行 HTML 不转义插值(non-HTML-escaped interpolation) -->
    {{{ meta }}}
  </head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```
过传入一个"渲染上下文对象"，作为 renderToString 函数的第二个参数，来提供插值数据：
```
const Vue=require('vue');
const server = require('express')()

const context = {
    title: '22',
    meta: `
      <meta ...>
      <meta ...>
    `
  }
const renderer=require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template2.html', 'utf-8')
});


server.get('*',(req,res)=>{
    const app=new Vue({
        data: {
            url: req.url
          },
        template:`<div>dddd</div>`
    })

    renderer.renderToString(app,context,(err,html)=>{
        console.log(html)
        if(err){
            res.status(500).end('Internal Server Error')
            return
        }
        res.end(html)
    })
})


// renderer.renderToString(app).then(html=>{
//     console.log(html)
// }).catch(err => {
//     console.error(err)
//   })
server.listen(8090)
```
