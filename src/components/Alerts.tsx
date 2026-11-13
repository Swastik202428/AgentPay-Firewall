import { useMemo, useState } from 'react'
import {
  ShieldAlert, AlertTriangle, ShieldCheck, Clock,
  Search, CheckCircle2, Eye, RotateCcw
} from 'lucide-react'
import { alerts } from '../data'
import type { Alert, Risk } from '../data'

type Filter = 'all' | Risk
type AlertState = 'new' | 'acknowledged' | 'resolved'

const severityStyle: Record<Risk, string> = {
  high: 'border-danger/30 bg-danger/10 text-danger',
  medium: 'border-warn/30 bg-warn/10 text-warn',
  low: 'border-safe/30 bg-safe/10 text-safe',
}

const severityLabel: Record<Risk, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export default function Alerts() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [states, setStates] = useState<Record<string, AlertState>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const alertList = useMemo(() => alerts, [])

  const getState = (id: string): AlertState => states[id] || 'new'

  const updateState = (id: string, state: AlertState) => {
    setStates((current) => ({ ...current, [id]: state }))
  }

  const filtered = alertList.filter((alert) => {
    const matchesFilter = filter === 'all' || alert.severity === filter
    const query = search.toLowerCase()
    const matchesSearch = `${alert.id} ${alert.title} ${alert.detail}`
      .toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  const highCount = alertList.filter((a) => a.severity === 'high').length
  const mediumCount = alertList.filter((a) => a.severity === 'medium').length
  const unresolvedCount = alertList.filter((a) => getState(a.id) !== 'resolved').length
  const resolvedCount = alertList.length - unresolvedCount

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Total alerts</span>
            <ShieldAlert size={19} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{alertList.length}</p>
          <p className="mt-1 text-xs text-muted">Security events detected</p>
        </div>
        <div className="rounded-xl border border-danger/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">High severity</span>
            <AlertTriangle size={19} className="text-danger" />
          </div>
          <p className="mt-3 text-3xl font-bold text-danger tabular-nums">{highCount}</p>
          <p className="mt-1 text-xs text-muted">Requires attention</p>
        </div>
        <div className="rounded-xl border border-warn/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Medium severity</span>
            <Eye size={19} className="text-warn" />
          </div>
          <p className="mt-3 text-3xl font-bold text-warn tabular-nums">{mediumCount}</p>
          <p className="mt-1 text-xs text-muted">Needs monitoring</p>
        </div>
        <div className="rounded-xl border border-safe/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Unresolved</span>
            <Clock size={19} className="text-safe" />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{unresolvedCount}</p>
          <p className="mt-1 text-xs text-muted">{resolvedCount} resolved in this session</p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Security alert center</h2>
            <p className="mt-1 text-xs text-muted">
              Review suspicious activity and track alert resolution.
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-safe/25 bg-safe/10 px-3 py-1.5 text-xs font-semibold text-safe">
            <span className="h-2 w-2 rounded-full bg-safe" />
            Monitoring active
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'high', 'medium', 'low'] as Filter[]).map((item) => (
              <button key={item} onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${
                  filter === item ? 'bg-signal text-white' : 'bg-raised text-muted hover:text-text'
                }`}>
                {item === 'all' ? 'All alerts' : `${item} severity`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..." className="w-36 bg-transparent text-sm outline-none placeholder:text-muted" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filtered.map((alert: Alert) => {
            const state = getState(alert.id)
            const isSelected = selected === alert.id

            return (
              <article key={alert.id} className="rounded-xl border border-line bg-raised/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      alert.severity === 'high' ? 'bg-danger/10 text-danger'
                        : alert.severity === 'medium' ? 'bg-warn/10 text-warn'
                        : 'bg-safe/10 text-safe'
                    }`}>
                      {alert.severity === 'high' ? <ShieldAlert size={19} />
                        : alert.severity === 'medium' ? <AlertTriangle size={19} />
                        : <ShieldCheck size={19} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted">{alert.id}</span>
                        <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${severityStyle[alert.severity]}`}>
                          {severityLabel[alert.severity]}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold">{alert.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{alert.detail}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={13} />{alert.time}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold capitalize ${
                    state === 'resolved' ? 'border-safe/30 bg-safe/10 text-safe'
                      : state === 'acknowledged' ? 'border-warn/30 bg-warn/10 text-warn'
                      : 'border-line bg-panel text-muted'
                  }`}>
                    {state}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                  <button onClick={() => setSelected(isSelected ? null : alert.id)}
                    className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:text-text">
                    {isSelected ? 'Hide details' : 'View details'}
                  </button>
                  {state !== 'acknowledged' && state !== 'resolved' && (
                    <button onClick={() => updateState(alert.id, 'acknowledged')}
                      className="flex items-center gap-1.5 rounded-lg border border-warn/30 px-3 py-2 text-xs font-semibold text-warn hover:bg-warn/10">
                      <Eye size={14} /> Acknowledge
                    </button>
                  )}
                  {state !== 'resolved' ? (
                    <button onClick={() => updateState(alert.id, 'resolved')}
                      className="flex items-center gap-1.5 rounded-lg border border-safe/30 px-3 py-2 text-xs font-semibold text-safe hover:bg-safe/10">
                      <CheckCircle2 size={14} /> Resolve alert
                    </button>
                  ) : (
                    <button onClick={() => updateState(alert.id, 'new')}
                      className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:text-text">
                      <RotateCcw size={14} /> Reopen
                    </button>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-3 rounded-lg border border-line bg-panel p-4">
                    <p className="text-xs font-semibold text-text">Alert investigation</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{alert.detail}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] text-muted">Alert reference</p>
                        <p className="mt-1 font-mono text-xs">{alert.id}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Severity classification</p>
                        <p className="mt-1 text-xs font-semibold capitalize">{alert.severity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              No matching alerts found.
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        Demo mode: alert acknowledgements and resolutions are stored only in the current page session.
        No external security system or payment network is connected.
      </p>
    </div>
  )
}
