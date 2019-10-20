import { apiUpdateFromRevision } from './api'

let db = null
let tasks = null

let revision = 0

function init(db) {
    const tasks = db.createObjectStore("tasks", { keyPath: "id" })
    tasks.createIndex("name", "name", { unique: false })
    tasks.createIndex("parent", "parent", { unique: false })

    const revision = db.createObjectStore("revision")
    revision.createIndex("revision")
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

export async function dbUpdate() {
    const data = await apiUpdateFromRevision(revision)
    revision = data.revision

    const tx = db.transaction("tasks", "readwrite")
    const tasks = tx.objectStore("tasks")

    for (const task of data.tasks) {
        tasks.put(task)
    }
}
