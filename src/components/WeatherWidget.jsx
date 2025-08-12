import { useEffect, useMemo, useState } from 'react'

// 簡易: weather_code を絵文字に
const codeToIcon = (code) => {
  if ([0].includes(code)) return '☀️'
  if ([1, 2].includes(code)) return '🌤️'
  if ([3].includes(code)) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
  if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌡️'
}

export default function WeatherWidget({ lat = 35.6812, lon = 139.7671, city = '東京' }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const url = useMemo(() => {
    const p = new URL('https://api.open-meteo.com/v1/forecast')
    p.searchParams.set('latitude', lat)
    p.searchParams.set('longitude', lon)
    p.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m')
    p.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
    p.searchParams.set('timezone', 'Asia/Tokyo')
    p.searchParams.set('forecast_days', '3')
    return p.toString()
  }, [lat, lon])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then((json) => setData(json))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'failed to load')
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [url])

  if (loading) return <div style={box}>天気を取得中…</div>
  if (error) return <div style={box}>取得エラー: {error}</div>
  if (!data) return null

  const cur = data.current
  const days = data.daily

  return (
    <div style={box}>
      <h2 style={{ margin: 0 }}>{city}の天気</h2>
      <div style={{ fontSize: 32 }}>
        {codeToIcon(cur.weather_code)} {cur.temperature_2m}°C
      </div>
      <div style={{ color: '#666', marginBottom: 8 }}>
        風 {Math.round(cur.wind_speed_10m)} m/s
      </div>

      <div style={grid}>
        {days.time.map((d, i) => (
          <div key={d} style={card}>
            <div style={{ fontWeight: 600 }}>
              {new Date(d).toLocaleDateString('ja-JP', { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </div>
            <div style={{ fontSize: 24 }}>{codeToIcon(days.weather_code[i])}</div>
            <div>
              最高 {Math.round(days.temperature_2m_max[i])} / 最低 {Math.round(days.temperature_2m_min[i])} °C
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        Source: Open-Meteo (no API key)
      </div>
    </div>
  )
}

const box = {
  padding: '16px',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
  maxWidth: 560,
  margin: '16px auto',
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
}

const card = {
  borderRadius: 12,
  padding: 12,
  background: '#f7f7f9',
  textAlign: 'center',
}
const cardHover = {
  ...card,
  transition: 'transform 0.2s',
}