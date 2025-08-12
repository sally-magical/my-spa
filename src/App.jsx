import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>ようこそ！My First SPA 🎉</h1>
      <p>これは Vite + React で作ったシンプルなページです。</p>

      <button
        onClick={() => setCount(count + 1)}
        style={{
          background: '#646cff',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        カウント: {count}
      </button>
    </div>
  )
}

export default App
