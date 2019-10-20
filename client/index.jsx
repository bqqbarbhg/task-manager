import React, { useState } from 'react'
import ReactDOM from 'react-dom'

function HelloWorld() {
  const [ clicks, setClicks ] = useState(0)

  return <button onClick={() => setClicks(clicks + 1)}>
    I've been clicked {clicks} times
  </button>
}

ReactDOM.render(<HelloWorld />, document.querySelector('#root'))