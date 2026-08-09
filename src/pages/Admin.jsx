import { useEffect, useState } from 'react'
import { ref, onValue, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase.js'
import './Admin.css'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme123'
const SESSION_KEY = 'sj_admin_authed'

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [form, setForm] = useState({
    gold24k: '',
    gold24plus: '',
    gold20k: '',
    silverPerGram: '',
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState(null) // null | 'ok' | 'error'
  const [loadedOnce, setLoadedOnce] = useState(false)

  useEffect(() => {
    if (!authed) return
    const ratesRef = ref(db, '/')
    const unsubscribe = onValue(ratesRef, (snapshot) => {
      const data = snapshot.val() || {}
      setForm({
        gold24k: data.gold?.['24k'] ?? '',
        gold24plus: data.gold?.['24+'] ?? '',
        gold20k: data.gold?.['20k'] ?? '',
        silverPerGram: data.silver?.perGram ?? '',
        note: data.note ?? '',
      })
      setLoadedOnce(true)
    })
    return () => unsubscribe()
  }, [authed])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      setLoginError('')
    } else {
      setLoginError('Incorrect password. Please try again.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setPassword('')
  }

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveState(null)
    try {
      const silverPerGram = form.silverPerGram === '' ? null : Number(form.silverPerGram)
      await update(ref(db, '/'), {
        gold: {
          '24k': form.gold24k === '' ? null : Number(form.gold24k),
          '24+': form.gold24plus === '' ? null : Number(form.gold24plus),
          '20k': form.gold20k === '' ? null : Number(form.gold20k),
        },
        silver: {
          perGram: silverPerGram,
          perKg: silverPerGram === null ? null : silverPerGram * 1000,
        },
        note: form.note,
        lastUpdated: serverTimestamp(),
      })
      setSaveState('ok')
    } catch (err) {
      console.error(err)
      setSaveState('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveState(null), 3500)
    }
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1 className="admin-login__title">Admin Access</h1>
          <p className="admin-login__subtitle">Enter the shared shop password to update today's rates.</p>
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button type="submit" className="admin-button">Sign in</button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h1 className="admin-panel__title">Update Today's Rate</h1>
            <p className="admin-panel__subtitle">Changes appear on the public page instantly.</p>
          </div>
          <button type="button" className="admin-link" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <fieldset className="admin-fieldset">
            <legend>Gold — ₹ per gram</legend>
            <div className="admin-grid">
              <label className="admin-field">
                <span>24K</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.gold24k}
                  onChange={handleChange('gold24k')}
                  required
                />
              </label>
              <label className="admin-field">
                <span>24+</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.gold24plus}
                  onChange={handleChange('gold24plus')}
                  required
                />
              </label>
              <label className="admin-field">
                <span>20K</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.gold20k}
                  onChange={handleChange('gold20k')}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="admin-fieldset">
            <legend>Silver — ₹ per gram</legend>
            <div className="admin-grid admin-grid--single">
              <label className="admin-field">
                <span>Per gram</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.silverPerGram}
                  onChange={handleChange('silverPerGram')}
                  required
                />
              </label>
            </div>
            <p className="admin-hint">Per-kg rate is calculated automatically (× 1000).</p>
          </fieldset>

          <fieldset className="admin-fieldset">
            <legend>Note (optional)</legend>
            <label className="admin-field">
              <span>Shown at the bottom of the public page</span>
              <textarea
                rows="3"
                value={form.note}
                onChange={handleChange('note')}
                placeholder="e.g. आज दुकान संध्याकाळी ७ वाजेपर्यंत सुरू राहील"
                className="admin-textarea"
              />
            </label>
            <p className="admin-hint">Leave blank to hide it from the public page.</p>
          </fieldset>

          <button type="submit" className="admin-button" disabled={saving || !loadedOnce}>
            {saving ? 'Updating…' : 'Update rates'}
          </button>

          {saveState === 'ok' && <p className="admin-success">Rates updated — live on the home page now.</p>}
          {saveState === 'error' && <p className="admin-error">Something went wrong. Check your connection and try again.</p>}
        </form>
      </div>
    </div>
  )
}