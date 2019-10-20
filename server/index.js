const json = require('koa-json')
const Koa = require('koa')
const app = new Koa()

app.use(json())

app.use((ctx) => {
  ctx.body = { foo: 'qwe' }
})

app.listen(process.env.API_PORT, () => {
  console.log(`Server started, listenting to :${process.env.API_PORT}`)
});
