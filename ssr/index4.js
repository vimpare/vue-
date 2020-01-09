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