import { TrendingUp, TrendingDown } from 'lucide-react'
import { stats, weekly, agents, transactions, alerts, riskLevel, money, type Status } from '../data'
import RiskGauge, { riskColor } from './RiskGauge'

const card = 'rounded-xl border border-line bg-panel p-5'
const statusStyle: Record<Status, string> = {
  approved: 'bg-safe/12 text-safe', blocked: 'bg-danger/12 text-danger', review: 'bg-warn/12 text-warn',
}
const sevStyle = { high: 'bg-danger', medium: 'bg-warn', low: 'bg-signal' }

function Stats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={card}>
          <p className="text-sm text-muted">{s.label}</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums">{s.value}</p>
          <p className={`mt-2 flex items-center gap-1 text-xs ${s.up ? 'text-safe' : 'text-danger'}`}>
            {s.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{s.change}
          </p>
        </div>
      ))}
    </div>
  )
}

function Chart() {
  const max = Math.max(...weekly.map((d) => d.approved + d.blocked))
  return (
    <section className={`${card} xl:col-span-2`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">Payments this week</h2>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-signal" />Approved</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" />Blocked</span>
        </div>
      </div>
      <div className="flex h-48 items-end gap-3">
        {weekly.map((d) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex w-full max-w-10 flex-col justify-end overflow-hidden rounded-md" style={{ height: `${(max > 0 ? ((d.approved + d.blocked) / max) * 100 : 0)}%` }}
              title={`${d.day}: ${d.approved} approved, ${d.blocked} blocked`}>
              <div className="bg-danger" style={{ height: `${(d.approved + d.blocked > 0 ? (d.blocked / (d.approved + d.blocked)) * 100 : 0)}%`, minHeight: 4 }} />
              <div className="flex-1 bg-signal/80" />
            </div>
            <span className="text-xs text-muted">{d.day}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Risk() {
  const overall = 46
  return (
    <section className={card}>
      <h2 className="mb-4 font-bold">Risk score</h2>
      <div className="flex justify-center"><RiskGauge score={overall} /></div>
      <ul className="mt-5 space-y-3">
        {agents.map((a) => (
          <li key={a.name}>
            <div className="mb-1 flex justify-between text-xs"><span>{a.name}</span><span className="tabular-nums text-muted">{a.risk}</span></div>
            <div className="h-1.5 rounded-full bg-line"><div className="h-full rounded-full" style={{ width: `${a.risk}%`, background: riskColor[riskLevel(a.risk)] }} /></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Recent() {
  return (
    <section className={`${card} xl:col-span-2`}>
      <h2 className="mb-4 font-bold">Recent transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr><th className="pb-3 font-medium">Payment</th><th className="pb-3 font-medium">Agent</th><th className="pb-3 text-right font-medium">Amount</th><th className="pb-3 font-medium pl-6">Risk</th><th className="pb-3 font-medium">Decision</th></tr>
          </thead>
          <tbody>
            {transactions.slice(0, 6).map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className="py-3"><p className="font-medium">{t.merchant}</p><p className="font-mono text-xs text-muted">{t.id} · {t.time}</p></td>
                <td className="py-3 text-muted">{t.agent}</td>
                <td className="py-3 text-right tabular-nums">{money(t.amount)}</td>
                <td className="py-3 pl-6 tabular-nums" style={{ color: riskColor[riskLevel(t.risk)] }}>{t.risk}</td>
                <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[t.status]}`}>{t.status === 'review' ? 'Needs review' : t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Alerts() {
  return (
    <section className={card}>
      <h2 className="mb-4 font-bold">Security alerts</h2>
      <ul className="space-y-4">
        {alerts.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sevStyle[a.severity]}`} />
            <div><p className="text-sm font-semibold">{a.title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted">{a.detail}</p><p className="mt-1 text-xs text-muted/70">{a.time}</p></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <Stats />
      <div className="grid gap-4 xl:grid-cols-3"><Chart /><Risk /><Recent /><Alerts /></div>
    </div>
  )
}

