import json from 'koa-json'
import Koa from 'koa'
import cors from '@koa/cors'
import { initDatabase } from './database.js'
import { query, initDbQuery } from './db-query'
import { router } from './router'

async function addTasks(parent, level) {
  if (level <= 0) return
  for (let i = 0; i < 10; i++) {
    const task = await query.addTask({ parent, name: 'Task' })
    await addTasks(task, level - 1)
  }
}

async function main() {
  const db = await initDatabase()
  await initDbQuery(db)

  addTasks(1, 3)

  const app = new Koa()

  app.use(cors())

  // TODO: pretty: false for production
  app.use(json())

  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(process.env.API_PORT, async () => {
    console.log(`Server started, listenting to :${process.env.API_PORT}`)
  });
}

main()


