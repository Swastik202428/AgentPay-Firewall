import { useMemo, useState } from 'react'
import {
  ShieldCheck, ShieldAlert, Ban, Eye, CheckCircle2,
  AlertTriangle, Activity, Search
} from 'lucide-react'
import { transactions, money, riskLevel, type Status } from '../data'

type Filter = 'all' | 'high' | 'medium' | 'low'

export default function RiskEngine() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [decisions, setDecisions] = useState<Record<string, Status>>({})

  const analyzed = useMemo(() => transactions.map((tx) => {
    const score = Math.max(0, Math.min(100, tx.risk))
    const level = riskLevel(score)
    const reason = tx.reason || 'No additional risk explanation available.'
    const factors: string[] = []

    if (/unknown|new wallet|unverified/i.test(reason + ' ' + tx.recipient)) {
      factors.push('Unknown or unverified recipient')
    }
    if (/limit|daily|monthly|exceed/i.test(reason)) {
      factors.push('Spending limit anomaly')
    }
    if (/spike|average|unusual|sudden/i.test(reason)) {
      factors.push('Unusual spending pattern')
    }
    if (/bank|account|changed|details/i.test(reason)) {
      factors.push('Recipient banking detail change')
    }
    if (/prompt|inject|hidden instruction/i.test(reason)) {
      factors.push('Possible prompt injection')
    }
    if (/watchlist|sanction|suspicious/i.test(reason)) {
      factors.push('High-risk recipient indicator')
    }
    if (factors.length === 0) factors.push(reason)

    return { ...tx, score, level, factors, explanation: reason }
  }), [])

  const filtered = analyzed.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.level === filter
    const query = search.toLowerCase()
    const matchesSearch = `${tx.id} ${tx.agent} ${tx.merchant} ${tx.recipient}`
      .toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  const highCount = analyzed.filter((tx) => tx.level === 'high').length
  const mediumCount = analyzed.filter((tx) => tx.level === 'medium').length
  const lowCount = analyzed.filter((tx) => tx.level === 'low').length

  const setDecision = (id: string, status: Status) => {
    setDecisions((current) => ({ ...current, [id]: status }))
  }

  const statusStyle: Record<Status, string> = {
    approved: 'border-safe/30 bg-safe/10 text-safe',
    blocked: 'border-danger/30 bg-danger/10 text-danger',
    review: 'border-warn/30 bg-warn/10 text-warn',
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Analyzed transactions</span>
            <Activity size={19} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{analyzed.length}</p>
          <p className="mt-1 text-xs text-muted">Sample transaction dataset</p>
        </div>
        <div className="rounded-xl border border-danger/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">High risk</span>
            <ShieldAlert size={19} className="text-danger" />
          </div>
          <p className="mt-3 text-3xl font-bold text-danger tabular-nums">{highCount}</p>
          <p className="mt-1 text-xs text-muted">Score 70–100</p>
        </div>
        <div className="rounded-xl border border-warn/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Medium risk</span>
            <AlertTriangle size={19} className="text-warn" />
          </div>
          <p className="mt-3 text-3xl font-bold text-warn tabular-nums">{mediumCount}</p>
          <p className="mt-1 text-xs text-muted">Score 40–69</p>
        </div>
        <div className="rounded-xl border border-safe/25 bg-panel p-5">
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Low risk</span>
            <ShieldCheck size={19} className="text-safe" />
          </div>
          <p className="mt-3 text-3xl font-bold text-safe tabular-nums">{lowCount}</p>
          <p className="mt-1 text-xs text-muted">Score 0–39</p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Transaction Risk Analysis</h2>
            <p className="mt-1 text-xs text-muted">
              Risk scores and explanations generated from demo transaction data.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-40 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(['all', 'high', 'medium', 'low'] as Filter[]).map((item) => (
            <button key={item} onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                filter === item ? 'bg-signal text-white' : 'bg-raised text-muted hover:text-text'
              }`}>
              {item === 'all' ? 'All risks' : `${item} risk`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((tx) => {
            const decision = decisions[tx.id] || tx.status
            const levelColor = tx.level === 'high'
              ? 'text-danger bg-danger/10 border-danger/25'
              : tx.level === 'medium'
                ? 'text-warn bg-warn/10 border-warn/25'
                : 'text-safe bg-safe/10 border-safe/25'

            return (
              <article key={tx.id} className="rounded-xl border border-line bg-raised/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted">{tx.id}</span>
                      <span className={`rounded-md border px-2 py-1 text-[11px] font-bold uppercase ${levelColor}`}>
                        {tx.level} risk
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold">{tx.merchant}</h3>
                    <p className="mt-1 text-xs text-muted">
                      Agent: {tx.agent} · Recipient: {tx.recipient}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums">{money(tx.amount)}</p>
                    <p className="text-xs text-muted">Transaction amount</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted">Risk score</span>
                      <span className="font-bold tabular-nums">{tx.score}/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${
                          tx.level === 'high' ? 'bg-danger' : tx.level === 'medium' ? 'bg-warn' : 'bg-safe'
                        }`}
                        style={{ width: `${tx.score}%` }}
                      />
                    </div>
                  </div>
                  <span className={`w-fit rounded-md border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle[decision]}`}>
                    {decision}
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-line bg-panel p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold">
                    <AlertTriangle size={14} className="text-warn" />
                    Risk explanation
                  </p>
                  <p className="text-xs leading-relaxed text-muted">{tx.explanation}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tx.factors.map((factor, index) => (
                      <span key={index} className="rounded-md bg-raised px-2 py-1 text-[11px] text-muted">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setDecision(tx.id, 'approved')}
                    className="flex items-center gap-1.5 rounded-lg border border-safe/30 px-3 py-2 text-xs font-semibold text-safe hover:bg-safe/10">
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button onClick={() => setDecision(tx.id, 'blocked')}
                    className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10">
                    <Ban size={14} /> Block
                  </button>
                  <button onClick={() => setDecision(tx.id, 'review')}
                    className="flex items-center gap-1.5 rounded-lg border border-warn/30 px-3 py-2 text-xs font-semibold text-warn hover:bg-warn/10">
                    <Eye size={14} /> Flag for review
                  </button>
                </div>
              </article>
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              No matching transactions found.
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        Demo environment: Approve, Block and Review update the local interface only.
        No real payment or wallet action is performed.
      </p>
    </div>
  )
}
