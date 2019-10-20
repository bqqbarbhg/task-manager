const json = require('koa-json')
const Koa = require('koa')
const app = new Koa()

app.use(json())

app.use((ctx) => {
  ctx.body = { foo: 'bar' }
})


app.listen(process.env.API_PORT);
