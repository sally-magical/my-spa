import { useEffect, useMemo, useState } from 'react'

// ---------- styles（上にまとめて定義） ----------
const styles = {
  wrap: { padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.08)', maxWidth: 800, margin: '16px auto' },
  controls: { display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' },
  note: { padding: '8px 0', color: '#555' },
  table: { width: '100%', borderCollapse: 'collapse' },
}

// ---------- utilities ----------
const toISO = (d) => new Date(d).toISOString().split('T')[0]
const today = new Date()
const defaultEnd = toISO(today)
const defaultStart = toISO(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000))

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

// ---------- component ----------
export default function WeatherHistory({
  lat = 35.6812,
  lon = 139.7671,
  city = '東京',
}) {
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const url = useMemo(() => {
    const u = new URL('https://archive-api.open-meteo.com/v1/archive')
    u.searchParams.set('latitude', lat)
    u.searchParams.set('longitude', lon)
    u.searchParams.set('start_date', start)
    u.searchParams.set('end_date', end)
    u.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum')
    u.searchParams.set('timezone', 'Asia/Tokyo')
    return u.toString()
  }, [lat, lon, start, end])

  const fetchData = () => {
    setLoading(true)
    setError('')
    setData(null)
    const ctrl = new AbortController()
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then((j) => setData(j))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'failed to load')
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    <div style={styles.wrap}>
      <h2 style={{ margin: 0 }}>{city}の過去天気</h2>

      <div style={styles.controls}>
        <label>
          開始日：
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          終了日：
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button onClick={fetchData}>再取得</button>
      </div>

      {loading && <div style={styles.note}>読み込み中…</div>}
      {error && <div style={{ ...styles.note, color: '#b00020' }}>エラー: {error}</div>}

      {data && data.daily && (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>日付</th>
                <th>天気</th>
                <th>最高(°C)</th>
                <th>最低(°C)</th>
                <th>降水量(mm)</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.time.map((d, i) => (
                <tr key={d}>
                  <td>{new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' })}</td>
                  <td style={{ fontSize: 20, textAlign: 'center' }}>{codeToIcon(data.daily.weather_code[i])}</td>
                  <td>{Math.round(data.daily.temperature_2m_max[i])}</td>
                  <td>{Math.round(data.daily.temperature_2m_min[i])}</td>
                  <td>{(data.daily.precipitation_sum[i] ?? 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Source: Open-Meteo Archive API</div>
        </div>
      )}
    </div>
  )
}
