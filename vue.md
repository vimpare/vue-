# vue

标签（空格分隔）： 框架

---
是一套构建用户界面的渐进式框架

把vue当成模板引擎来用，

基础
==
声明式的渲染
------

允许采用简洁的模板语法来声明式的将数据渲染进DOM,

    <div id="app">
      {{ message }}
    </div>
    
    //js
    var app = new Vue({
      el: '#app',
      data: {
        message: 'Hello Vue!'
      }
    })

v-bind
------

    <body>
    <div id="app-2">
        <span v-bind:title="message">
            鼠标悬停几秒钟查看此处动态绑定的提示信息！
        </span>
    </div>
    <script src="./vue.js"></script>
    <script>
        var app2 = new Vue({
            el: '#app-2',
            data: {
                message: '页面加载于 ' + new Date().toLocaleString()//本地字符串
            }
        })
    </script>
    </body>

指令：指令带有前缀 v-，以表示它们是 Vue 提供的特殊属性；
这里**该指令的作用是：“将这个元素节点的 title 属性和 Vue 实例的 message 属性保持一致”**。

条件与循环
-----
控制切换一个元素的显示：

v-if
----

控制是否渲染在页面中  在页面中初始进来判断需不需要渲染某块结构

v-for
-----

 指令可以绑定数组的数据来渲染一个项目列表

不需要关系具体的实现细节，只需要告诉程序怎么做就行了，重心是在业务逻辑上，不是在实现细节上。

声明式编程
命令式编程

	命令式编程：命令“机器”如何去做事情(how)，这样不管你想要的是什么(what)，它都会按照你的命令实现。
	
	声明式编程：告诉“机器”你想要的是什么(what)，让机器想出如何去做(how)。


响应的数据绑定
	内置是使用Object.defineProperty追踪变化的
	已$开头的属性，是vue内置提供，用来区分开发者添加的属性
	

v-model
-------
指令
可交互的元素：
input select textarea
有value这个属性 可以赋值
可交互的元素交互之后数据发生变化，页面也要发生变化

v-show
------

   控制元素的显示和隐藏  频繁切换用v-show

