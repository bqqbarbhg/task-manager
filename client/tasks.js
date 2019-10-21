import { dbGetTaskChildren } from "./db";

function identity() { }

let onVisibleTasksChanged = identity
let taskOpened = { }

function updateVisibleChildren(task, numVisibleChildren) {
}

function getTaskInstance(id, parent) {
    let task = tasksById[id]
    if (task !== undefined) {
        return task
    }
    task = new Task(id, parent, parent.level + 1)
    tasksById[id] = task
    return task
}

class Task {
    id = ""
    parent = null
    level = 0

    name = ""
    children = []
    opened = false
    numVisibleItems = 1
    childrenLoaded = false
    onRefresh = identity

    constructor(id, parent, level) {
        this.id = id
        this.parent = parent
        this.level = level

        this.reloadChildren = this.reloadChildren.bind(this)
        this.toggleOpen = this.toggleOpen.bind(this)
    }

    updateNumVisible() {
        let num = 1
        if (this.opened) {
            for (let child of this.children) {
                num += child.numVisibleItems
            }
        }
        const delta = num - this.numVisibleItems
        if (delta === 0) return
        this.numVisibleItems = num
        for (let t = this.parent; t !== null && t.opened; t = t.parent) {
            t.numVisibleItems += delta
        }
        onVisibleTasksChanged(rootTask.numVisibleItems)
    }

    setOpen(open) {
        if (this.opened === open) return
        this.opened = open
        taskOpened[this.id] = open

        this.updateNumVisible()

        if (!this.childrenLoaded) {
            dbGetTaskChildren(this.id).then(this.reloadChildren)
        }
        this.onRefresh()
    }

    toggleOpen() {
        this.setOpen(!this.opened)
    }

    unload() {
        this.children = []
        this.loaded = false
        this.updateNumVisible()
    }

    reloadChildren(children) {
        const prevNumChildren = this.children.length
        this.children = children.map((data) => {
            const task = getTaskInstance(data.id, this)
            task.name = data.name
            return task
        })
        this.childrenLoaded = true
        this.updateNumVisible()

        for (const child of this.children) {
            if (taskOpened[child.id]) child.setOpen(true)
        }
    }
}

let rootTask = new Task("root", null, 0)
let tasksById = { "root": rootTask }

function getVisibleTaskImp(task, localIndex) {
    if (localIndex === 0) return task
    localIndex--
    for (const child of task.children) {
        if (localIndex < child.numVisibleItems) {
            return getVisibleTaskImp(child, localIndex)
        } else {
            localIndex -= child.numVisibleItems
        }
    }
    return null
}

export function getNumVisibleTasks() {
    return rootTask.numVisibleItems
}

export function getVisibleTask(index) {
    return getVisibleTaskImp(rootTask, index)
}

export function registerOnVisibleTasksChanged(callback) {
    onVisibleTasksChanged = callback
}

export function initTasks() {
    rootTask.setOpen(true)
}

if (/* DEBUG */ true) {
    window.rootTask = rootTask
    window.tasksById = tasksById

    // Maybe not DEBUG?
    window.addEventListener("beforeunload", () => {
        sessionStorage.setItem("openTasks", JSON.stringify(taskOpened))
    })

    taskOpened = JSON.parse(sessionStorage.getItem("openTasks") || "{}")
    window.taskOpened = taskOpened
}
