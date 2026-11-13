import { useMemo, useState, type FormEvent } from 'react'
import {
  ShieldCheck, ShieldAlert, Plus, Pencil, Trash2,
  Power, X, Save, Wallet, ListChecks, AlertTriangle
} from 'lucide-react'
import { agentProfiles, money } from '../data'

type PolicyType = 'spending' | 'allowlist' | 'approval' | 'security'

interface Policy {
  id: string
  name: string
  type: PolicyType
  agent: string
  description: string
  threshold: number
  enabled: boolean
}

const initialPolicies: Policy[] = [
  {
    id: 'POL-001', name: 'Daily spending cap', type: 'spending',
    agent: 'All agents', description: 'Flag spending that exceeds the configured daily amount.',
    threshold: 5000, enabled: true,
  },
  {
    id: 'POL-002', name: 'Monthly spending cap', type: 'spending',
    agent: 'All agents', description: 'Monitor cumulative monthly agent spending.',
    threshold: 50000, enabled: true,
  },
  {
    id: 'POL-003', name: 'Approved merchants only', type: 'allowlist',
    agent: 'Procurement Agent', description: 'Only pay merchants present in the agent allowlist.',
    threshold: 0, enabled: true,
  },
  {
    id: 'POL-004', name: 'Manual approval threshold', type: 'approval',
    agent: 'All agents', description: 'Require human review for payments above this amount.',
    threshold: 2000, enabled: true,
  },
  {
    id: 'POL-005', name: 'High-risk transaction block', type: 'security',
    agent: 'All agents', description: 'Flag transactions with risk scores at or above this value.',
    threshold: 70, enabled: true,
  },
]

const typeLabels: Record<PolicyType, string> = {
  spending: 'Spending limit',
  allowlist: 'Merchant allowlist',
  approval: 'Approval rule',
  security: 'Security rule',
}

const typeStyles: Record<PolicyType, string> = {
  spending: 'bg-signal/10 text-signal',
  allowlist: 'bg-safe/10 text-safe',
  approval: 'bg-warn/10 text-warn',
  security: 'bg-danger/10 text-danger',
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [name, setName] = useState('')
  const [type, setType] = useState<PolicyType>('spending')
  const [agent, setAgent] = useState('All agents')
  const [description, setDescription] = useState('')
  const [threshold, setThreshold] = useState('')

  const enabledCount = policies.filter((p) => p.enabled).length
  const disabledCount = policies.length - enabledCount
  const filtered = useMemo(() => policies.filter((p) => {
    if (filter === 'enabled') return p.enabled
    if (filter === 'disabled') return !p.enabled
    return true
  }), [policies, filter])

  const resetForm = () => {
    setName('')
    setType('spending')
    setAgent('All agents')
    setDescription('')
    setThreshold('')
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (policy: Policy) => {
    setEditingId(policy.id)
    setName(policy.name)
    setType(policy.type)
    setAgent(policy.agent)
    setDescription(policy.description)
    setThreshold(String(policy.threshold))
    setShowForm(true)
  }

  const savePolicy = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = Number(threshold)

    if (!name.trim() || !description.trim() || !Number.isFinite(value) || value < 0) return

    if (editingId) {
      setPolicies((current) => current.map((p) => p.id === editingId
        ? { ...p, name: name.trim(), type, agent, description: description.trim(), threshold: value }
        : p))
    } else {
      setPolicies((current) => [...current, {
        id: `POL-${String(Date.now()).slice(-6)}`,
        name: name.trim(),
        type,
        agent,
        description: description.trim(),
        threshold: value,
        enabled: true,
      }])
    }
    resetForm()
  }

  const togglePolicy = (id: string) => {
    setPolicies((current) => current.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  const deletePolicy = (id: string) => {
    setPolicies((current) => current.filter((p) => p.id !== id))
    if (editingId === id) resetForm()
  }

  const thresholdLabel = (policy: Policy) => {
    if (policy.type === 'security') return `Risk score: ${policy.threshold}+ / 100`
    if (policy.type === 'allowlist') return 'Approved merchants only'
    return `Threshold: ${money(policy.threshold)}`
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Total policies</span>
            <ListChecks size={19} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{policies.length}</p>
          <p className="mt-1 text-xs text-muted">Configured demo rules</p>
        </div>
        <div className="rounded-xl border border-safe/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Active policies</span>
            <ShieldCheck size={19} className="text-safe" />
          </div>
          <p className="mt-3 text-3xl font-bold text-safe tabular-nums">{enabledCount}</p>
          <p className="mt-1 text-xs text-muted">Currently enabled</p>
        </div>
        <div className="rounded-xl border border-warn/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Disabled policies</span>
            <Power size={19} className="text-warn" />
          </div>
          <p className="mt-3 text-3xl font-bold text-warn tabular-nums">{disabledCount}</p>
          <p className="mt-1 text-xs text-muted">Not currently active</p>
        </div>
        <div className="rounded-xl border border-danger/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Security rules</span>
            <ShieldAlert size={19} className="text-danger" />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {policies.filter((p) => p.type === 'security' && p.enabled).length}
          </p>
          <p className="mt-1 text-xs text-muted">Enabled security policies</p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Policy management</h2>
            <p className="mt-1 text-xs text-muted">Configure the rules that govern agent payments.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            <Plus size={17} /> Create policy
          </button>
        </div>

        {showForm && (
          <form onSubmit={savePolicy} className="mt-5 space-y-4 rounded-xl border border-signal/30 bg-raised p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{editingId ? 'Edit policy' : 'Create new policy'}</h3>
              <button type="button" onClick={resetForm} aria-label="Close form" className="text-muted hover:text-text">
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-muted">
                Policy name
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vendor payment cap"
                  className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-text outline-none focus:border-signal" />
              </label>

              <label className="space-y-1.5 text-xs text-muted">
                Policy type
                <select value={type} onChange={(e) => setType(e.target.value as PolicyType)}
                  className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-text outline-none focus:border-signal">
                  <option value="spending">Spending limit</option>
                  <option value="allowlist">Merchant allowlist</option>
                  <option value="approval">Approval rule</option>
                  <option value="security">Security rule</option>
                </select>
              </label>

              <label className="space-y-1.5 text-xs text-muted">
                Apply to agent
                <select value={agent} onChange={(e) => setAgent(e.target.value)}
                  className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-text outline-none focus:border-signal">
                  <option>All agents</option>
                  {agentProfiles.map((a) => <option key={a.id}>{a.name}</option>)}
                </select>
              </label>

              <label className="space-y-1.5 text-xs text-muted">
                {type === 'security' ? 'Risk score threshold (0–100)' : type === 'allowlist' ? 'Threshold (not used for allowlist)' : 'Amount threshold (USD)'}
                <input required type="number" min="0" max={type === 'security' ? 100 : undefined}
                  value={threshold} onChange={(e) => setThreshold(e.target.value)}
                  placeholder={type === 'security' ? '70' : type === 'allowlist' ? '0' : '2000'}
                  className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-text outline-none focus:border-signal" />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs text-muted">
              Rule description
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what this policy should check..."
                rows={2}
                className="w-full resize-y rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-text outline-none focus:border-signal" />
            </label>

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white">
                <Save size={16} /> {editingId ? 'Save changes' : 'Create policy'}
              </button>
              <button type="button" onClick={resetForm}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-muted">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {(['all', 'enabled', 'disabled'] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${
                filter === item ? 'bg-signal text-white' : 'bg-raised text-muted hover:text-text'
              }`}>
              {item === 'all' ? 'All policies' : `${item} policies`}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map((policy) => (
            <article key={policy.id} className="rounded-xl border border-line bg-raised/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${typeStyles[policy.type]}`}>
                    {policy.type === 'spending' ? <Wallet size={19} />
                      : policy.type === 'allowlist' ? <ListChecks size={19} />
                      : policy.type === 'approval' ? <AlertTriangle size={19} />
                      : <ShieldAlert size={19} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-muted">{policy.id}</span>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${typeStyles[policy.type]}`}>
                        {typeLabels[policy.type]}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold">{policy.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{policy.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span>Agent: {policy.agent}</span>
                      <span>{thresholdLabel(policy)}</span>
                    </div>
                  </div>
                </div>
                <span className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                  policy.enabled ? 'border-safe/30 bg-safe/10 text-safe' : 'border-line bg-panel text-muted'
                }`}>
                  {policy.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                <button onClick={() => startEdit(policy)}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:text-text">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => togglePolicy(policy.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    policy.enabled ? 'border-warn/30 text-warn hover:bg-warn/10' : 'border-safe/30 text-safe hover:bg-safe/10'
                  }`}>
                  <Power size={14} /> {policy.enabled ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => deletePolicy(policy.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              No policies in this filter.
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        Demo mode: policy changes are stored in local page state only. These rules are not yet connected to the transaction approval pipeline or a live payment service.
      </p>
    </div>
  )
}

