import { useEffect, useMemo, useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { transactions, riskLevel, money, statusLabel, type Status, type Transaction } from '../data'
import { riskColor } from './RiskGauge'

const PAGE_SIZE = 8
const statusStyle: Record<Status, string> = {
  approved: 'bg-safe/12 text-safe', blocked: 'bg-danger/12 text-danger', review: 'bg-warn/12 text-warn',
}
const filters: { id: 'all' | Status; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'approved', label: 'Approved' },
  { id: 'blocked', label: 'Blocked' }, { id: 'review', label: 'Needs review' },
]

function RiskBadge({ score }: { score: number }) {
  const level = riskLevel(score)
  const c = riskColor[level]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
      style={{ color: c, background: `color-mix(in srgb, ${c} 14%, transparent)` }}>
      {score}<span className="font-medium capitalize">{level}</span>
    </span>
  )
}
const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status]}`}>{statusLabel[status]}</span>
)
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC'

function exportCsv(list: Transaction[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['ID', 'Agent', 'Vendor', 'Recipient', 'Amount (USD)', 'Decision', 'Risk score', 'Timestamp', 'Reason']
  const body = list.map((t) => [t.id, t.agent, t.merchant, t.recipient, t.amount, statusLabel[t.status], t.risk, t.timestamp, t.reason].map(esc).join(','))
  const blob = new Blob([[head.map(esc).join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'agentpay-transactions.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

function Detail({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const fields: [string, React.ReactNode][] = [
    ['Amount', <span className="text-lg font-bold tabular-nums">{money(tx.amount)}</span>],
    ['Agent', tx.agent], ['Vendor', tx.merchant],
    ['Recipient', <span className="break-all font-mono text-xs">{tx.recipient}</span>],
    ['Risk score', <RiskBadge score={tx.risk} />], ['Decision', <StatusBadge status={tx.status} />],
    ['Timestamp', fmtDate(tx.timestamp)],
  ]
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Transaction ${tx.id}`} onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto border-l border-line bg-panel p-6">
        <div className="mb-6 flex items-start justify-between">
          <div><h2 className="text-lg font-bold">Transaction details</h2><p className="font-mono text-xs text-muted">{tx.id}</p></div>
          <button aria-label="Close details" onClick={onClose} className="rounded-md p-1 text-muted hover:text-text"><X size={20} /></button>
        </div>
        <dl className="divide-y divide-line">
          {fields.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg border border-line bg-raised p-4">
          <p className="mb-1 text-sm font-semibold">Why this decision</p>
          <p className="text-sm leading-relaxed text-muted">{tx.reason}</p>
        </div>
      </div>
    </div>
  )
}

export default function Transactions() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | Status>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Transaction | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((t) =>
      (status === 'all' || t.status === status) &&
      (!q || [t.id, t.merchant, t.agent].some((f) => f.toLowerCase().includes(q))))
  }, [query, status])

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const count = (s: 'all' | Status) => (s === 'all' ? transactions.length : transactions.filter((t) => t.status === s).length)

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block lg:w-80">
          <span className="sr-only">Search transactions</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search vendor, ID or agent"
            className="w-full rounded-lg border border-line bg-raised py-2.5 pl-9 pr-3 text-sm placeholder:text-muted focus:border-signal focus:outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button key={f.id} onClick={() => { setStatus(f.id); setPage(1) }} aria-pressed={status === f.id}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${status === f.id ? 'border-signal bg-signal/12 text-signal' : 'border-line text-muted hover:text-text'}`}>
              {f.label} <span className="tabular-nums opacity-70">{count(f.id)}</span>
            </button>
          ))}
          <button onClick={() => exportCsv(results)} disabled={!results.length}
            className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40">
            <Download size={14} />Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>{['Payment', 'Agent', 'Amount', 'Risk', 'Decision', 'Time'].map((h, i) => (
              <th key={h} className={`pb-3 font-medium ${i === 2 ? 'text-right' : ''} ${i === 3 ? 'pl-6' : ''}`}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} tabIndex={0} onClick={() => setSelected(t)} onKeyDown={(e) => e.key === 'Enter' && setSelected(t)}
                className="cursor-pointer border-t border-line transition-colors hover:bg-raised">
                <td className="py-3"><p className="font-medium">{t.merchant}</p><p className="font-mono text-xs text-muted">{t.id}</p></td>
                <td className="py-3 text-muted">{t.agent}</td>
                <td className="py-3 text-right tabular-nums">{money(t.amount)}</td>
                <td className="py-3 pl-6"><RiskBadge score={t.risk} /></td>
                <td className="py-3"><StatusBadge status={t.status} /></td>
                <td className="py-3 text-muted">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p className="py-10 text-center text-sm text-muted">No transactions match. Try a different search or filter.</p>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
        <span>{results.length ? `${(current - 1) * PAGE_SIZE + 1}–${(current - 1) * PAGE_SIZE + visible.length} of ${results.length}` : '0 results'}</span>
        <div className="flex items-center gap-2">
          <button aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-md border border-line p-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="tabular-nums">Page {current} of {pages}</span>
          <button aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-md border border-line p-1.5 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
      {selected && <Detail tx={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
