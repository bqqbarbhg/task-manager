import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { getNumVisibleTasks, getVisibleTask, registerOnVisibleTasksChanged, initTasks } from './tasks'
import { dbInitialize, dbGetTaskChildren, dbUpdate } from './db'
import VirtualList from 'react-tiny-virtual-list'

function identity() { }

class Task extends React.Component {

  constructor(props) {
    super(props)
    this.refresh = this.forceUpdate.bind(this)
    props.task.onRefresh = this.refresh
  }

  componentWillUnmount() {
    this.props.task.onRefresh = identity
  }

  render() {
    const { task, style } = this.props
    return <div style={style}>
        <span>{">".repeat(task.level + 1)}</span>
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
  debugSetOpenAllImp(getVisibleTask(0), true) // TODO: getRootTask()
}
function debugCloseAll() {
  debugSetOpenAllImp(getVisibleTask(0), false) // TODO: getRootTask()
}

class TaskList extends React.Component {

  constructor(props) {
    super(props)
    this.state = { numVisibleTasks: 1 }
  }

  componentDidMount() {
    registerOnVisibleTasksChanged((num) => {
      this.setState({ numVisibleTasks: num })
    })
  }

  componentWillUnmount() {
    registerOnVisibleTasksChanged(null)
  }

  render() {
    const num = this.state.numVisibleTasks
    return <div>
      <VirtualList
        width="100%"
        height={600}
        itemCount={num}
        itemSize={28}
        renderItem={renderTask}
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
  initTasks()

  ReactDOM.render(<TaskList />, document.querySelector('#root'))
}

init()
