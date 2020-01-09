
const server = require('express')()
const vueApp = require('./src/app.js');

const renderer=require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
});


server.get('*',(req,res)=>{
  let vm = vueApp({});

  res.status(200);
  res.setHeader("Content-type", "text/html;charset-utf-8");

  renderer.renderToString(vm).then((html) => {
    res.end(html);
  }).catch(err => console.log(err))
})


// renderer.renderToString(app).then(html=>{
//     console.log(html)
// }).catch(err => {
//     console.error(err)
//   })
server.listen(8090)