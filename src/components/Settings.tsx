import { useState } from 'react'
import { Bell, Shield, Lock, SlidersHorizontal, Save, RotateCcw } from 'lucide-react'

interface Preferences {
  emailAlerts: boolean
  securityAlerts: boolean
  weeklyReport: boolean
  twoFactor: boolean
  sessionLock: boolean
  strictMode: boolean
}

const defaults: Preferences = {
  emailAlerts: true,
  securityAlerts: true,
  weeklyReport: false,
  twoFactor: true,
  sessionLock: true,
  strictMode: false,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-signal' : 'bg-line'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function Settings() {
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [riskThreshold, setRiskThreshold] = useState('70')
  const [approvalLimit, setApprovalLimit] = useState('2000')
  const [saved, setSaved] = useState(false)

  const update = (key: keyof Preferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const save = () => setSaved(true)
  const reset = () => {
    setPreferences(defaults)
    setRiskThreshold('70')
    setApprovalLimit('2000')
    setSaved(false)
  }

  const sections = [
    {
      title: 'Notifications',
      description: 'Choose which demo notifications are enabled.',
      icon: Bell,
      items: [
        { key: 'emailAlerts' as const, label: 'Email notifications', detail: 'Receive updates about platform activity.' },
        { key: 'securityAlerts' as const, label: 'Security alerts', detail: 'Show alerts for suspicious agent activity.' },
        { key: 'weeklyReport' as const, label: 'Weekly summary', detail: 'Enable a sample weekly activity summary.' },
      ],
    },
    {
      title: 'Account security',
      description: 'Manage the security preferences shown in this demo.',
      icon: Lock,
      items: [
        { key: 'twoFactor' as const, label: 'Two-factor authentication', detail: 'Display 2FA as an enabled account preference.' },
        { key: 'sessionLock' as const, label: 'Session lock', detail: 'Enable the session-lock preference.' },
      ],
    },
    {
      title: 'Risk preferences',
      description: 'Set the thresholds displayed in the demo configuration.',
      icon: Shield,
      items: [
        { key: 'strictMode' as const, label: 'Strict review mode', detail: 'Prefer stricter review settings in this demo.' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-signal/10 text-signal">
            <SlidersHorizontal size={21} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">System settings</h2>
            <p className="mt-1 text-xs text-muted">Configure preferences for your AgentPay demo workspace.</p>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="rounded-xl border border-line bg-panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <section.icon size={19} className="text-signal" />
            <div>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="mt-0.5 text-xs text-muted">{section.description}</p>
            </div>
          </div>
          <div className="divide-y divide-line">
            {section.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </div>
                <Toggle checked={preferences[item.key]} onChange={(value) => update(item.key, value)} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-line bg-panel p-5">
        <h3 className="font-semibold">Risk engine thresholds</h3>
        <p className="mt-1 text-xs text-muted">Demo configuration values. These do not change the live risk engine.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted">High-risk score threshold (0–100)</span>
            <input type="number" min="0" max="100" value={riskThreshold}
              onChange={(e) => { setRiskThreshold(e.target.value); setSaved(false) }}
              className="w-full rounded-lg border border-line bg-raised px-3 py-2.5 text-text outline-none focus:border-signal" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Manual approval amount (USD)</span>
            <input type="number" min="0" value={approvalLimit}
              onChange={(e) => { setApprovalLimit(e.target.value); setSaved(false) }}
              className="w-full rounded-lg border border-line bg-raised px-3 py-2.5 text-text outline-none focus:border-signal" />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save}
          className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          <Save size={16} /> Save preferences
        </button>
        <button onClick={reset}
          className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-muted hover:text-text">
          <RotateCcw size={16} /> Reset defaults
        </button>
        {saved && <span className="text-sm font-medium text-safe">Demo preferences saved for this page session.</span>}
      </div>

      <p className="text-xs text-muted">Demo mode: preferences are held in local page state and reset when the page is reloaded. No real account security, email delivery or backend configuration is changed.</p>
    </div>
  )
}
