# node.js

标签（空格分隔）： node

---
node.js//平台
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境。 
Node.js 使用了一个事件驱动、非阻塞式 I/O（输入/输出端口）的模型，使其轻量又高效。
https://www.npmjs.com/

npm 包管理器
--------
npm -v" 来测试是否成功安装
包 ：模块
-----

模块：
js模块是中匿名函数自执行，作用：把n多个类似的功能封装在一起
node 中一个文件就是一个模块，一个js文件，功能相似的放在一起
新建文件夹名字尽量不要用模块名
**express??**
npm 发布模块，下载模块

 

1.使用/加载模块
---------

---------

**1.1加载一个文件模块**
要暴露模块api，要把暴露的函数挂载在moudel.exports上
使用require加载模块是，会默认返回本模块的module。exports这个对象
module.exports
require（相对路径、绝对路径）
模块加载器，用在浏览器端
require.js、国外    依赖前置，模块加载完之后在使用，后来实现依赖就近 

    AMD

sea.js 国内     依赖就近，按需加载，

    CMD规范   
        引入模块使用require
        定义模块 defined(function(){})

nodejs采用**commonJS规范**
----------------------

如何定义和加载模块
http://javascript.ruanyifeng.com/nodejs/module.html

CommonJS规范规定，每个模块内部，module变量代表当前模块。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。加载某个模块，其实是加载该模块的module.exports属性。
浏览器端一般采用AMD规范

**es6的module**

module.exports改写
module.exports={}



**require命令**用于加载文件，后缀名默认为.js。
require方法用于加载模块。
**1.2内置模块**
无需使用npm下载
安装node时已经安装好了
http   fs
**1.3文件夹模块**
别人提供的模块
第三方模块   express
安装：
 **npm i 模块**
 安装好之后，express 包就放在了工程目录下的 node_modules 目录中，因此在代码中只需要通过 require('express') 的方式就好，无需指定第三方包路径。
 
 
 警告 没有描述没有仓库地址没有协议
 文件夹模块中都包含package.json用来描述这个文件
 查找模块：先找内置模块，然后本项目的node-modules里

学习： http fs
-----------

    let http = require('http');
    let fs=require('fs')
    // 创建服务
    // request, responese
    let app = http.createServer((req,res) => {
    	// 当有请求过来了，会触发这个函数
    	console.log("有请求来了");
    	// request对象 	保存的是请求的信息
    	// responese对象 保存的是响应的功能
    	//console.log(req);
    
    	res.write('ok'); //向客户端响应内容
    	res.end();
    })
    
    app.listen(3000, () => {
    	console.log("服务启动了");
    })

**createServer（）**是一个创建一个服务对象。有请求来了，会触发这个函数，两个参数，request保存的是请求的信息，response保存的是响应的功能。

**若请求的是一个页面，响应的时候该怎么做？**
req.url  可以拿到地址路径

    if(req.url === '/index.html'){
		// 返回index.html，需要读取index.html里面的内容发送

		fs.readFile('./views/index.html', (error,data) => {
			if(error){
				console.log(error);
			}else{
				console.log(data);  // buffer类型的里面存的额是二进制的
				console.log( data.toString('utf-8') );
				res.write(data); //向客户端响应内容
				res.end();
			}
			
		})

**fs.readFile**(path[, options], callback)
    异步地读取一个文件的全部内容。 
    回调函数有两个参数，(err, data)，其中 data 是文件的内容。
    错误前置，异步形式，错误先执行。
    
**fs.readFileSync**(path[, options])  fs.readFile() 的同步版本。 返回 path 的内容。
使用同步方法，报错了，下面代码是不执行的

    let d = fs.readFileSync('./views/index.html');
    console.log(d);

捕获错误，使用try，catch

    try{
    	let d = fs.readFileSync('./abcde.txt');
    	console.log(d.toString());
    }catch(err){
    	console.log(err);
    }

 fs文件系统
 mkdir
 readdir  异步和同步
 
**fs.existsSync（path）**
 操作文件之前，先判断文件存不存在
 如果文件存在，返回true，不存在，返回false
 

 **fs.writeFile()**创建写入文件
 fs.writeFile(file, data[, options], callback)
 异步地写入数据到文件，如果文件已经存在，则替代文件。 data 可以是一个字符串或一个 buffer。
 

    fs.writeFile('./data/users.json', JSON.stringify([...d3,...arr]) ,{flag: 'w'},(err,data) => {
		console.log(err,data);
	})
	


---------------------------
**请求的地址不只是html文件，也可能是css/js**

    let http=require('http')
    let fs=require('fs')
    let app=http.createServer((req,res)=>{
        let url=req.url
        let re=/\.(js|css)$/g;//正则表达式
        if(re.test(url)){
            let d=fs.readFileSync('./static'+url)
             res.end(d)
        }else{
            if(url === '/a'){
    			let d = fs.readFileSync('./views/index.html');
    			res.end(d);
    		}else if(url === '/b'){
    			let d = fs.readFileSync('./views/miaov.html');
    			res.end(d);
    		}else{
    			let d = fs.readFileSync('./views/404.html');
    			res.end(d);
    		}
        }
    })
    app.listen(3100,()=>{
        console.log('funwu')
    })

