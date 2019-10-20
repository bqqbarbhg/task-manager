import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { getNumVisibleTasks, getVisibleTask, registerOnVisibleTasksChanged } from './tasks'
import { dbInitialize, dbGetTaskChildren, dbUpdate } from './db'

function identity() { }

class Task extends React.Component {

  constructor(props) {
    super(props)
    this.refresh = this.forceUpdate.bind(this)
  }

  componentWillUnmount() {
    this.props.task.onRefresh = identity
  }

  render() {
    const { task } = this.props
    task.onRefresh = this.refresh
    return <><tr>
      <td>
        {">".repeat(task.level + 1)}
        <button onClick={task.toggleOpen}>{ task.opened ? "-" : "+" }</button>
        <span>{task.name}</span>
      </td>
      <td>{task.id}</td>
    </tr></>
  }
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
    let tasks = []
    for (let i = 0; i < num; i++) {
      const task = getVisibleTask(i)
      tasks.push(<Task task={task} key={i}></Task>)
    }
    return <table>{tasks}</table>

  }

}

async function init() {
  await dbInitialize()
  await dbUpdate()

  ReactDOM.render(<TaskList />, document.querySelector('#root'))
}

init()
