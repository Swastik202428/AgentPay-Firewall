import { useEffect, useState } from 'react'
import { Search, Plus, Copy, Check, Pencil, Pause, Play, X } from 'lucide-react'
import { agentProfiles, transactions, riskLevel, money, statusLabel, type AgentProfile, type AgentStatus, type Status } from '../data'
import { riskColor } from './RiskGauge'
import AgentForm, { type AgentFormValues } from './AgentForm'

const filters: { id: 'all' | AgentStatus; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'suspended', label: 'Suspended' },
]
const txStyle: Record<Status, string> = { approved: 'text-safe', blocked: 'text-danger', review: 'text-warn' }
const short = (w: string) => `${w.slice(0, 8)}…${w.slice(-6)}`

function Bar({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const pct = Math.min(100, (spent / limit) * 100)
  const color = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warn' : 'bg-signal'
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">{money(spent)} <span className="text-muted">of {money(limit)} · {Math.round(pct)}%</span></span>
      </div>
      <div className="h-2 rounded-full bg-line" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: AgentStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'active' ? 'bg-safe/12 text-safe' : 'bg-muted/15 text-muted'}`}>{status === 'active' ? 'Active' : 'Suspended'}</span>
}

function RiskBadge({ score }: { score: number }) {
  const c = riskColor[riskLevel(score)]
  return <span className="rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums capitalize" style={{ color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }}>{score} {riskLevel(score)}</span>
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) } catch { /* clipboard blocked */ }
  }
  return (
    <button onClick={copy} aria-label="Copy wallet address" className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-text">
      {done ? <><Check size={13} className="text-safe" />Copied</> : <><Copy size={13} />Copy</>}
    </button>
  )
}

function Detail({ agent, onClose, onEdit, onToggle }: { agent: AgentProfile; onClose: () => void; onEdit: () => void; onToggle: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const recent = transactions.filter((t) => t.agent === agent.name).slice(0, 5)
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={agent.name} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-lg overflow-y-auto border-l border-line bg-panel p-6">
        <div className="mb-5 flex items-start justify-between">
          <div><h2 className="text-lg font-bold">{agent.name}</h2><p className="text-xs text-muted">{agent.type} · {agent.id}</p></div>
          <button aria-label="Close details" onClick={onClose} className="text-muted hover:text-text"><X size={20} /></button>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <StatusPill status={agent.status} /><RiskBadge score={agent.risk} />
          <div className="ml-auto flex gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-text"><Pencil size={13} />Edit</button>
            <button onClick={onToggle} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-text">
              {agent.status === 'active' ? <><Pause size={13} />Suspend</> : <><Play size={13} />Resume</>}</button>
          </div>
        </div>
        <h3 className="mb-3 text-sm font-semibold">Spending</h3>
        <div className="space-y-4"><Bar label="Today" spent={agent.spentToday} limit={agent.dailyLimit} /><Bar label="This month" spent={agent.spentMonth} limit={agent.monthlyLimit} /></div>
        <h3 className="mb-3 mt-6 text-sm font-semibold">Wallet</h3>
        <div className="rounded-lg border border-line bg-raised p-3">
          <p className="break-all font-mono text-xs">{agent.wallet}</p>
          <div className="mt-2 flex items-center justify-between"><p className="text-xs text-muted">Demo address. Not a real wallet on any blockchain.</p><CopyButton text={agent.wallet} /></div>
        </div>
        <h3 className="mb-3 mt-6 text-sm font-semibold">Trusted recipients</h3>
        {agent.allowlist.length ? (
          <div className="flex flex-wrap gap-2">{agent.allowlist.map((r) => <span key={r} className="rounded-full border border-line bg-raised px-2.5 py-1 text-xs">{r}</span>)}</div>
        ) : <p className="text-xs text-muted">No trusted recipients yet. Use Edit to add some.</p>}
        <h3 className="mb-3 mt-6 text-sm font-semibold">Recent transactions</h3>
        {recent.length ? (
          <ul className="divide-y divide-line text-sm">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div><p className="font-medium">{t.merchant}</p><p className="font-mono text-xs text-muted">{t.id} · {t.time}</p></div>
                <div className="text-right"><p className="tabular-nums">{money(t.amount)}</p><p className={`text-xs font-semibold ${txStyle[t.status]}`}>{statusLabel[t.status]}</p></div>
              </li>
            ))}
          </ul>
        ) : <p className="text-xs text-muted">No transactions yet for this agent.</p>}
      </div>
    </div>
  )
}

export default function Agents() {
  const [agents, setAgents] = useState<AgentProfile[]>(agentProfiles)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | AgentStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<{ agent?: AgentProfile } | null>(null)

  const q = query.trim().toLowerCase()
  const visible = agents.filter((a) => (status === 'all' || a.status === status) && (!q || [a.name, a.type, a.wallet, a.id].some((f) => f.toLowerCase().includes(q))))
  const selected = agents.find((a) => a.id === selectedId) ?? null
  const count = (s: 'all' | AgentStatus) => (s === 'all' ? agents.length : agents.filter((a) => a.status === s).length)

  const toggle = (id: string) => setAgents((list) => list.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' } : a)))
  const save = (v: AgentFormValues) => {
    if (form?.agent) {
      const id = form.agent.id
      setAgents((list) => list.map((a) => (a.id === id ? { ...a, ...v } : a)))
    } else {
      const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      const id = `AG-${String(agents.length + 1).padStart(2, '0')}`
      setAgents((list) => [...list, { ...v, id, wallet: `0x${hex}`, risk: 20, spentToday: 0, spentMonth: 0, status: 'active' }])
    }
    setForm(null)
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block lg:w-80">
          <span className="sr-only">Search agents</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, type or wallet"
            className="w-full rounded-lg border border-line bg-panel py-2.5 pl-9 pr-3 text-sm placeholder:text-muted focus:border-signal focus:outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setStatus(f.id)} aria-pressed={status === f.id}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${status === f.id ? 'border-signal bg-signal/12 text-signal' : 'border-line text-muted hover:text-text'}`}>
              {f.label} <span className="tabular-nums opacity-70">{count(f.id)}</span></button>
          ))}
          <button onClick={() => setForm({})} className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-xs font-bold text-ink"><Plus size={14} />Create agent</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {visible.map((a) => (
          <div key={a.id} tabIndex={0} onClick={() => setSelectedId(a.id)} onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && setSelectedId(a.id)}
            className={`cursor-pointer rounded-xl border border-line bg-panel p-5 transition-colors hover:border-signal/50 ${a.status === 'suspended' ? 'opacity-70' : ''}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="font-bold">{a.name}</h2><p className="text-xs text-muted">{a.type}</p></div>
              <StatusPill status={a.status} />
            </div>
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-raised px-3 py-2">
              <span className="font-mono text-xs">{short(a.wallet)}</span><CopyButton text={a.wallet} />
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted">Risk</p><div className="mt-1"><RiskBadge score={a.risk} /></div></div>
              <div><p className="text-muted">Daily limit</p><p className="mt-1 text-sm font-semibold tabular-nums">{money(a.dailyLimit)}</p></div>
              <div><p className="text-muted">Monthly limit</p><p className="mt-1 text-sm font-semibold tabular-nums">{money(a.monthlyLimit)}</p></div>
            </div>
            <div className="space-y-3"><Bar label="Spent today" spent={a.spentToday} limit={a.dailyLimit} /><Bar label="This month" spent={a.spentMonth} limit={a.monthlyLimit} /></div>
            <div className="mt-4 flex gap-2 border-t border-line pt-4">
              <button onClick={(e) => { e.stopPropagation(); setForm({ agent: a }) }} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-text"><Pencil size={13} />Edit</button>
              <button onClick={(e) => { e.stopPropagation(); toggle(a.id) }} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-text">
                {a.status === 'active' ? <><Pause size={13} />Suspend</> : <><Play size={13} />Resume</>}</button>
            </div>
          </div>
        ))}
      </div>
      {!visible.length && <p className="rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">No agents match. Try a different search or filter.</p>}

      {selected && <Detail agent={selected} onClose={() => setSelectedId(null)} onEdit={() => setForm({ agent: selected })} onToggle={() => toggle(selected.id)} />}
      {form && <AgentForm agent={form.agent} onSave={save} onClose={() => setForm(null)} />}
    </section>
  )
}
