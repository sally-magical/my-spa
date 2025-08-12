import { useState } from 'react'
import './App.css'
import WeatherWidget from './components/WeatherWidget'
import WeatherHistory from './components/WeatherHistory'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-card" style={{ textAlign: 'center' }}>
{/*       <h1 className="app-title">ようこそ！My First SPA 🎉</h1>
      <p className="app-desc">これは Vite + React で作ったシンプルなページです。</p>

      <button
        className="app-btn"
        onClick={() => setCount(count + 1)}
      >
        カウント: {count}
      </button> */}
      <WeatherWidget lat={35.6812} lon={139.7671} city="東京・丸の内" className="weather-widget" />
      <WeatherHistory lat={35.6812} lon={139.7671} city="東京・過去天気" className="weather-history" />
    </div>
  )
}

export default App
