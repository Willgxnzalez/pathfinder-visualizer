import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-red-500">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
