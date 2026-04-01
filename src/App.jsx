import { useState } from 'react'
import './App.css'

function ipToInt(ip) {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function isIpInCidr(ip, cidr) {
  const [network, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr, 10)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false
  const ipInt = ipToInt(ip)
  const networkInt = ipToInt(network)
  if (ipInt === null || networkInt === null) return false
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return (ipInt & mask) === (networkInt & mask)
}

function App() {
  const [cidrs, setCidrs] = useState('')
  const [ip, setIp] = useState('')
  const [result, setResult] = useState(null) // { match: bool, cidr?: string }
  const [shaking, setShaking] = useState(false)

  const handleCheck = () => {
    const cidrList = cidrs.split(',').map(c => c.trim()).filter(Boolean)
    const ipTrimmed = ip.trim()

    if (!cidrList.length || !ipTrimmed) return

    for (const cidr of cidrList) {
      if (isIpInCidr(ipTrimmed, cidr)) {
        setResult({ match: true, cidr })
        setShaking(false)
        return
      }
    }

    setResult({ match: false })
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const bgClass = result === null ? '' : result.match ? 'bg-green' : 'bg-red'

  return (
    <div className={`container ${bgClass} ${shaking ? 'shake' : ''}`}>
      <h1>CIDR Range Checker</h1>

      <div className="form">
        <label>
          <span>CIDR Range(s)</span>
          <input
            type="text"
            placeholder="10.0.0.0/8, 192.168.1.0/24"
            value={cidrs}
            onChange={e => { setCidrs(e.target.value); setResult(null) }}
          />
        </label>

        <label>
          <span>IP Address</span>
          <input
            type="text"
            placeholder="192.168.1.42"
            value={ip}
            onChange={e => { setIp(e.target.value); setResult(null) }}
          />
        </label>

        <button onClick={handleCheck}>Check</button>
      </div>

      {result && (
        <div className="result">
          {result.match ? (
            <>
              <p className="result-title">Your IP is in range!</p>
              <p className="result-cidr">{ip.trim()} falls within <strong>{result.cidr}</strong></p>
            </>
          ) : (
            <>
              <p className="result-title">This IP does not fall within your CIDR ranges</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
