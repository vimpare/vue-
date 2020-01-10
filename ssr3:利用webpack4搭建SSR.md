之前学习了ssr的基本用法
现在使用webpack4来搭建ssr
依然利用之前的目录结构
![1926235014-5d171101b8358_articlex.png](https://upload-images.jianshu.io/upload_images/4954358-5824fc5c193cafa5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
#####   建立build文件夹，用于存放webpack相关配置
创建:
通用配置`webpack.base.conf.js`、
客户端配置`webpack.client.conf.js`、
服务端配置`webpack.server.conf.js`
```
├── build
│   ├── webpack.base.conf.js   # 基本webpack配置
│   ├── webpack.client.conf.js # 客户端webpack配置
│   └── webpack.server.conf.js # 服务器端webpack配置
├── src
├── index.template.html
└── index.js
```
(部分结构)

webpack.base.conf.js配置主要定义通用的rules，例如vue-loader对.vue文件编译，对js文件babel编译，处理图片、字体等；



```
const path = require('path')
// vue-loader v15版本需要引入此插件
const VueLoaderPlugin = require('vue-loader/lib/plugin')
 
// 用于返回文件相对于根目录的绝对路径
const resolve = dir => path.resolve(__dirname, '..', dir)
 
module.exports = {
  entry: resolve('src/entry-client.js'),
  // 生成文件路径、名字、引入公共路径
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    // 对于.js、.vue引入不需要写后缀
    extensions: ['.js', '.vue'],
    // 引入components、assets可以简写，可根据需要自行更改
    alias: {
      'components': resolve('src/components'),
      'assets': resolve('src/assets')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // 配置哪些引入路径按照模块方式查找
          transformAssetUrls: {
            video: ['src', 'poster'],
            source: 'src',
            img: 'src',
            image: 'xlink:href'
          }
        }
      },
      {
        test: /\.js$/, 
        loader: 'babel-loader',
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/, // 处理图片
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/img/[name].[hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, // 处理字体
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
```
webpack.client.conf.js主要是对客户端代码进行打包，它是通过webpack-merge实现对基础配置的合并
```

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
 
module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  output: {
 
   
    filename: 'static/js/[name].[chunkhash].js',
    chunkFilename: 'static/js/[id].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
      
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
      },
    ]
  },
  devtool: false,
  plugins: [
    // webpack4.0版本以上采用MiniCssExtractPlugin 而不使用extract-text-webpack-plugin
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css',
      chunkFilename: 'static/css/[name].[contenthash].css'
    }),
    //  当vendor模块不再改变时, 根据模块的相对路径生成一个四位数的hash作为模块id
    new webpack.HashedModuleIdsPlugin(),
    //添加了这个配置以后，重新启动项目通过地址就可以访问到vue-ssr-client-manifest.json,页面中出现的内容就是所需要的client-bundle
    new VueSSRClientPlugin()
  ]
})
```
服务端webpack配置:
```

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
//  在服务端渲染中，所需要的文件都是使用require引入，不需要把node_modules文件打包
const nodeExternals = require('webpack-node-externals')
const baseWebpackConfig = require('./webpack.base.conf')
const VueServerPlugin = require('vue-server-renderer/server-plugin')
 
module.exports = merge(baseWebpackConfig, {
//  告知webpack，需要在node端运行
  mode: 'production',
  target: 'node',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../src/entry-server.js'),
  output: {
    libraryTarget: 'commonjs2',
    filename: 'server-bundle.js',
  },
  // 这里有个坑... 服务端也需要编译样式，但不能使用mini-css-extract-plugin，
  // 因为它会使用document，但服务端并没document，导致打包报错。详情见
  // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/48#issuecomment-375288454
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        use: ['css-loader/locals', 'stylus-loader']
      }
    ]
  },
  // 不要外置化 webpack 需要处理的依赖模块
  externals: nodeExternals({
    whitelist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"server"'
    }),
    // 默认文件名为 `vue-ssr-server-bundle.json`
    new VueServerPlugin()
  ]
})
```

新建build命令，执行俩端的配置==>多了一个dist文件夹，其中除了静态文件以外，生成了用于服务端渲染的JSON文件：
vue-ssr-client-manifest.json和
vue-ssr-server-bundle.json
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build:client": "webpack --config build/webpack.client.conf.js",
    "build:server": "webpack --config build/webpack.server.conf.js",
    "start": "node index.js",
    "build": "npm run build:client && npm run build:server"
  }
```
最后修改index.js来实现整个服务器端渲染流程
获取俩个JSON文件、html模板作为参数传入createBundleRenderer，vue实例不再需要
```
const express = require("express");
const app = express();

const { createBundleRenderer } = require('vue-server-renderer')

let path = require("path");

// 获取客户端、服务器端生成的json文件、html模板文件
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')


const template = require("fs").readFileSync(path.join(__dirname,"./index.template.html"),"utf-8")




app.get('*', async(request, response) => {

    response.status(200);
    response.setHeader("Content-type", "text/html;charset-utf-8");

    
    const renderer = createBundleRenderer(serverBundle, {
        runInNewContext: false, // 推荐
        template, // 页面模板
        clientManifest // 客户端构建 manifest
      })
      renderer.renderToString({
            url:request.url
        }).then((html) => {
            response.end(html);
        }).catch(error => {
            response.end(JSON.stringify(error));
        });
})

app.listen(3006, () => {
    console.log('服务已开启')
})
```

项目中用到的一些依赖：
```
npm install webpack-cli
npm install webpack-merge
npm install webpack-node-externals
npm install @babel/core
npm install @babel/plugin-syntax-dynamic-import
npm install babel-loader
npm install css-loader
npm install eslint-friendly-formatter mini-css-extract-plugin
npm install style-loader stylus stylus-loader
npm install url-loader vue-loader vue-template-compiler
```
