import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase.js'
import CornerOrnament from '../components/CornerOrnament.jsx'
import DiamondDivider from '../components/DiamondDivider.jsx'
import './Home.css'

const SHOP_NAME = 'Shri Jewellers'

function formatRupees(value) {
  if (value === undefined || value === null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Home() {
  const [rates, setRates] = useState(null)
  const [flash, setFlash] = useState(false)
  const [status, setStatus] = useState('loading') // loading | ok | error

  useEffect(() => {
    const ratesRef = ref(db, '/')
    const unsubscribe = onValue(
      ratesRef,
      (snapshot) => {
        setRates(snapshot.val())
        setStatus('ok')
        setFlash(true)
        const t = setTimeout(() => setFlash(false), 900)
        return () => clearTimeout(t)
      },
      () => setStatus('error')
    )
    return () => unsubscribe()
  }, [])

  const gold = rates?.gold || {}
  const silver = rates?.silver || {}
  const lastUpdated = rates?.lastUpdated

  return (
    <div className="board-page">
      <div className="board-page__glow" aria-hidden="true" />

      <header className="board-header">
        <p className="board-header__eyebrow">Est. Trust · Since Generations</p>
        <h1 className="board-header__name">{SHOP_NAME}</h1>
        <p className="board-header__tagline">Today's Bullion Rate</p>
      </header>

      <main className={`rate-card ${flash ? 'rate-card--flash' : ''}`}>
        <CornerOrnament className="rate-card__corner rate-card__corner--tl" />
        <CornerOrnament className="rate-card__corner rate-card__corner--tr" />
        <CornerOrnament className="rate-card__corner rate-card__corner--bl" />
        <CornerOrnament className="rate-card__corner rate-card__corner--br" />

        {status === 'error' && (
          <p className="rate-card__error">
            Couldn't reach the live rate feed. Showing may be out of date — please refresh.
          </p>
        )}

        <section className="metal-section" aria-labelledby="gold-heading">
          <h2 id="gold-heading" className="metal-section__title metal-section__title--gold">
            Gold <span className="metal-section__unit">(per gram)</span>
          </h2>
          <div className="purity-grid">
            <div className="purity-cell">
              <span className="purity-cell__label">24K</span>
              <span className="purity-cell__value">
                <span className="rupee">₹</span>
                {formatRupees(gold['24k'])}
              </span>
            </div>
            <div className="purity-cell purity-cell--emphasis">
              <span className="purity-cell__label">22K</span>
              <span className="purity-cell__value">
                <span className="rupee">₹</span>
                {formatRupees(gold['22k'])}
              </span>
            </div>
            <div className="purity-cell">
              <span className="purity-cell__label">18K</span>
              <span className="purity-cell__value">
                <span className="rupee">₹</span>
                {formatRupees(gold['18k'])}
              </span>
            </div>
          </div>
        </section>

        <DiamondDivider />

        <section className="metal-section" aria-labelledby="silver-heading">
          <h2 id="silver-heading" className="metal-section__title metal-section__title--silver">
            Silver
          </h2>
          <div className="purity-grid purity-grid--two">
            <div className="purity-cell">
              <span className="purity-cell__label">Per gram</span>
              <span className="purity-cell__value purity-cell__value--silver">
                <span className="rupee">₹</span>
                {formatRupees(silver.perGram)}
              </span>
            </div>
            <div className="purity-cell">
              <span className="purity-cell__label">Per kg</span>
              <span className="purity-cell__value purity-cell__value--silver">
                <span className="rupee">₹</span>
                {formatRupees(silver.perKg ?? (silver.perGram ? silver.perGram * 1000 : null))}
              </span>
            </div>
          </div>
        </section>

        <footer className="rate-card__footer">
          <span className={`live-dot ${status === 'ok' ? 'live-dot--on' : ''}`} aria-hidden="true" />
          <span>
            {status === 'loading' ? 'Connecting to live rates…' : `Last updated: ${formatTimestamp(lastUpdated)}`}
          </span>
        </footer>
      </main>

      <p className="board-page__note">Rates are indicative and exclude making charges &amp; GST.</p>
    </div>
  )
}
