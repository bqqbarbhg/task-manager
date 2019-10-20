import json from 'koa-json'
import Koa from 'koa'
import { initDatabase } from './database.js'

async function main() {
  const db = await initDatabase()
  const app = new Koa()
  app.use(json())

  app.listen(process.env.API_PORT, async () => {
    console.log(`Server started, listenting to :${process.env.API_PORT}`)
  });
}

main()


