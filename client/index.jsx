import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { getNumVisibleTasks, getVisibleTask, registerOnVisibleTasksChanged, getRootTask, initTasks, openTaskTreeById } from './tasks'
import { dbInitialize, dbGetTaskChildren, dbUpdate } from './db'
import VirtualList from 'react-tiny-virtual-list'

function noop() { }

class Task extends React.Component {

  constructor(props) {
    super(props)
    this.refresh = this.forceUpdate.bind(this)
    props.task.onRefresh = this.refresh
  }

  componentWillUnmount() {
    this.props.task.onRefresh = noop
  }

  render() {
    const { task, style } = this.props
    return <div style={style}>
        <span>{">".repeat(task.level)}</span>
        <button onClick={task.toggleOpen}>{ task.opened ? "-" : "+" }</button>
        <span>{task.name}</span>
        <span> {task.id}</span>
    </div>
  }
}

function renderTask({index, style}) {
  const task = getVisibleTask(index)

  return <Task task={task} style={style} key={task.id}></Task>
}

function debugSetOpenAllImp(task, open) {
  if (task.opened) {
    for (const child of task.children) {
      debugSetOpenAllImp(child, open)
    }
  }
  task.setOpen(open)
}

function debugOpenAll() {
  debugSetOpenAllImp(getRootTask(), true)
}
function debugCloseAll() {
  debugSetOpenAllImp(getRootTask(), false)
}

let g_numUpdatePrevTimeMs = 0
let g_numCloseUpdatesInARow = 0
let g_numVisibleTasks = 0
let g_numUpdateTimeout = null

let g_scrollTop = 0

try {
  g_scrollTop = JSON.parse(sessionStorage.scrollOffset)
} catch (err) { /* Nop */ }

function taskListScroll(scrollTop) {
  g_scrollTop = scrollTop
}

class TaskList extends React.Component {

  constructor(props) {
    super(props)
    this.state = { numVisibleTasks: 1 }
    this.firstRender = true

    this.updateNumVisibleTasks = this.updateNumVisibleTasks.bind(this)
  }

  updateNumVisibleTasks() {
    this.setState({ numVisibleTasks: g_numVisibleTasks })
    g_numUpdateTimeout = null

    // Set previous update time to prevent pulsing N updates in a row when thottled
    g_numUpdatePrevTimeMs = Date.now()
  }

  componentDidMount() {
    registerOnVisibleTasksChanged((num) => {
      g_numVisibleTasks = num
      if (g_numUpdateTimeout) return

      const timeMs = Date.now()
      if (g_numUpdatePrevTimeMs + 100.0 >= timeMs) {
        g_numCloseUpdatesInARow++
      } else {
        g_numCloseUpdatesInARow = 0
      }
      g_numUpdatePrevTimeMs = timeMs

      if (g_numCloseUpdatesInARow < 5) {
        this.updateNumVisibleTasks()
      } else {
        g_numUpdateTimeout = window.setTimeout(this.updateNumVisibleTasks, 100)
      }
    })
  }

  componentWillUnmount() {
    registerOnVisibleTasksChanged(null)
  }

  render() {
    // HACK: We keep the number of tasks in state but it might be outdated
    // by the time we get here so better to use the canonical value instead...
    const num = getNumVisibleTasks()

    let scrollOffset = undefined
    if (this.firstRender) {
      this.firstRender = false
      scrollOffset = g_scrollTop
    }

    return <div>
      <VirtualList
        width="100%"
        height={600}
        itemCount={num}
        itemSize={28}
        renderItem={renderTask}
        onScroll={taskListScroll}
        scrollOffset={scrollOffset}
      />
      <div>Open tasks: {num}</div>
      <div>
        <button onClick={debugOpenAll}>Open all !</button>
        <button onClick={debugCloseAll}>Close all !</button>
      </div>
    </div>

  }

}

async function init() {
  await dbInitialize()
  await dbUpdate()

  await openTaskTreeById(7)

  initTasks()

  // Need to wait for current tasks to open (+ race vs timeout)
  window.setTimeout(() => {
    ReactDOM.render(<TaskList />, document.querySelector('#root'))
  }, 100)
}

init()

// TODO: Centralize these?
window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("scrollOffset", JSON.stringify(g_scrollTop))
})
