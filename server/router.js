import Router from 'koa-router'
import { query } from './db-query'

export const router = new Router()

router.get('/version', (ctx) => {
  ctx.body = { version: "0.0.1" }
})

router.get('/task/:task/children', async (ctx) => {
  ctx.body = await query.taskChildren({ task: ctx.params.task })
})

router.get('/task/:task/tree', async (ctx) => {
  let tasks = []
  let task = await query.task({ task: ctx.params.task })
  if (!task || task.parent <= 0) {
    ctx.body = await query.taskChildren({ task: 1 })
    return
  }

  while (task.parent >= 1) {
    const siblings = await query.taskChildren({ task: task.parent })
    tasks.push(...siblings)
    task = await query.task({ task: task.parent })
  }
  ctx.body = tasks
})
