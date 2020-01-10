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
