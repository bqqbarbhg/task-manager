import { apiUpdateFromRevision } from './api'

let db = null
let tasks = null

function init(db) {
  const tasks = db.createObjectStore("tasks", { keyPath: "id" })
  tasks.createIndex("name", "name", { unique: false })
  tasks.createIndex("parent", "parent", { unique: false })
  
  db.createObjectStore("info", { keyPath: "name" })
}

export function dbInitialize() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open("task-manager", 1)
    req.onerror = (err) => {
      console.error("Failed to initialize IndexedDB", err)
      reject(err)
    }
    req.onsuccess = (event) => {
      db = event.target.result
      db.onerror = (err) => {
        console.error("IndexedDB", err)
      }
      resolve()
    }
    req.onupgradeneeded = (event) => {
      const db = event.target.result
      init(db)
    }
  })
}

export function dbGetTaskChildren(taskId) {

  /*
  return fetch(`http://localhost:3000/task/${taskId}/children`)
    .then(r => r.json())
    */

  return new Promise((resolve, reject) => {
    const tx = db.transaction("tasks")
    const tasks = tx.objectStore("tasks")
    const tasksParent = tasks.index("parent")
    const children = tasksParent.getAll(taskId)
    children.onerror = reject
    children.onsuccess = () => {
      resolve(children.result)
    }
  })
}

export async function dbGetTaskTree(taskId) {

  const data = await fetch(`http://localhost:3000/task/${taskId}/tree`).then(r => r.json())
  const parentId = {}

  const tx = db.transaction(["tasks"], "readwrite")
  const tasks = tx.objectStore("tasks")
  for (const task of data) {
    parentId[task.id] = task.parent
    tasks.put(task)
  }

  tx.commit()

  let tree = []
  for (let t = taskId; t > 0; t = parentId[t]) {
    tree.push(t)
  }
  return tree
}

async function dbUpdateImp(revision) {
  const data = await apiUpdateFromRevision(revision)
  if (data.revision == revision) return
  
  const tx = db.transaction(["tasks", "info"], "readwrite")
  const tasks = tx.objectStore("tasks")
  const info = tx.objectStore("info")
  
  for (const task of data.tasks) {
    tasks.put(task)
  }
  
  info.put({ name: "revision", revision: data.revision })

  tx.commit()
}

export async function dbUpdate() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("info")
    const info = tx.objectStore("info")
    const revision = info.get("revision")
    revision.onerror = reject
    revision.onsuccess = () => {
      let rev = (revision.result ? revision.result.revision : 0) || 0
      dbUpdateImp(rev).then(resolve).catch(reject)
    }
  })
}
