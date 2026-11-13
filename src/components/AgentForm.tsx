import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { agentTypes, type AgentProfile } from '../data'

export interface AgentFormValues { name: string; type: string; dailyLimit: number; monthlyLimit: number; allowlist: string[] }

const field = 'w-full rounded-lg border border-line bg-raised px-3 py-2.5 text-sm placeholder:text-muted focus:border-signal focus:outline-none'

export default function AgentForm({ agent, onSave, onClose }: { agent?: AgentProfile; onSave: (v: AgentFormValues) => void; onClose: () => void }) {
  const [name, setName] = useState(agent?.name ?? '')
  const [type, setType] = useState(agent?.type ?? agentTypes[0])
  const [daily, setDaily] = useState(String(agent?.dailyLimit ?? ''))
  const [monthly, setMonthly] = useState(String(agent?.monthlyLimit ?? ''))
  const [allow, setAllow] = useState(agent?.allowlist.join('\n') ?? '')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    const d = Number(daily), m = Number(monthly), errs: string[] = []
    if (!name.trim()) errs.push('Enter an agent name.')
    if (!(d > 0)) errs.push('Daily limit must be more than $0.')
    if (!(m > 0)) errs.push('Monthly limit must be more than $0.')
    if (d > 0 && m > 0 && m < d) errs.push('Monthly limit cannot be lower than the daily limit.')
    setErrors(errs)
    if (errs.length) return
    const list = [...new Set(allow.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean))]
    onSave({ name: name.trim(), type, dailyLimit: d, monthlyLimit: m, allowlist: list })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={agent ? 'Edit agent' : 'Create agent'} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-line bg-panel p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{agent ? 'Edit agent' : 'Create agent'}</h2>
          <button aria-label="Close" onClick={onClose} className="text-muted hover:text-text"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm"><span className="mb-1.5 block text-muted">Agent name</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Subscriptions Agent" /></label>
          <label className="block text-sm"><span className="mb-1.5 block text-muted">Agent type</span>
            <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
              {agentTypes.map((t) => <option key={t}>{t}</option>)}
            </select></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm"><span className="mb-1.5 block text-muted">Daily limit (USD)</span>
              <input className={field} type="number" min="0" value={daily} onChange={(e) => setDaily(e.target.value)} placeholder="2000" /></label>
            <label className="block text-sm"><span className="mb-1.5 block text-muted">Monthly limit (USD)</span>
              <input className={field} type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="25000" /></label>
          </div>
          <label className="block text-sm"><span className="mb-1.5 block text-muted">Trusted recipients (one per line or comma-separated)</span>
            <textarea className={`${field} h-24 resize-none`} value={allow} onChange={(e) => setAllow(e.target.value)} placeholder={'AWS\nCloudflare'} /></label>
          {errors.length > 0 && (
            <ul role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-text">Cancel</button>
          <button onClick={submit} className="rounded-lg bg-signal px-4 py-2 text-sm font-bold text-ink">{agent ? 'Save changes' : 'Create agent'}</button>
        </div>
      </div>
    </div>
  )
}
