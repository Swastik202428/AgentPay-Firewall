import { useMemo, useState } from 'react'
import { Search, Download, ShieldCheck, ShieldAlert, Bot, Settings, FileText } from 'lucide-react'

type EventType = 'Transaction' | 'Security' | 'Policy' | 'Agent' | 'System'

interface AuditEvent {
  id: string
  action: string
  detail: string
  actor: string
  type: EventType
  status: 'Success' | 'Blocked' | 'Warning'
  time: string
}

const initialEvents: AuditEvent[] = [
  { id: 'LOG-1001', action: 'High-risk payment blocked', detail: 'TX-90411 · Unknown wallet · $9,800', actor: 'Risk Engine', type: 'Transaction', status: 'Blocked', time: 'Today, 10:42 AM' },
  { id: 'LOG-1002', action: 'Security alert generated', detail: 'New unverified wallet detected', actor: 'Security Monitor', type: 'Security', status: 'Warning', time: 'Today, 10:36 AM' },
  { id: 'LOG-1003', action: 'Agent suspended', detail: 'Vendor Payout Agent · AG-04', actor: 'Admin', type: 'Agent', status: 'Success', time: 'Today, 09:58 AM' },
  { id: 'LOG-1004', action: 'Policy updated', detail: 'Daily spending cap changed to $5,000', actor: 'Admin', type: 'Policy', status: 'Success', time: 'Today, 09:24 AM' },
  { id: 'LOG-1005', action: 'Transaction sent for review', detail: 'TX-90410 · Ad Spend Agent · $1,450', actor: 'Risk Engine', type: 'Transaction', status: 'Warning', time: 'Today, 09:12 AM' },
  { id: 'LOG-1006', action: 'Prompt injection detected', detail: 'Suspicious instructions found in invoice data', actor: 'Security Monitor', type: 'Security', status: 'Blocked', time: 'Yesterday, 04:18 PM' },
  { id: 'LOG-1007', action: 'Agent spending limit checked', detail: 'Procurement Agent · Within configured limit', actor: 'Policy Engine', type: 'Policy', status: 'Success', time: 'Yesterday, 03:45 PM' },
  { id: 'LOG-1008', action: 'Dashboard session started', detail: 'Demo administrator session', actor: 'System', type: 'System', status: 'Success', time: 'Yesterday, 10:05 AM' },
]

const statusStyle = {
  Success: 'bg-safe/10 text-safe border-safe/20',
  Blocked: 'bg-danger/10 text-danger border-danger/20',
  Warning: 'bg-warn/10 text-warn border-warn/20',
}

export default function AuditLogs() {
  const [events] = useState(initialEvents)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => events.filter((event) => {
    const matchesFilter = filter === 'All' || event.type === filter
    const text = `${event.id} ${event.action} ${event.detail} ${event.actor}`.toLowerCase()
    return matchesFilter && text.includes(query.toLowerCase())
  }), [events, filter, query])

  const exportCSV = () => {
    const header = ['ID', 'Action', 'Details', 'Actor', 'Type', 'Status', 'Time']
    const rows = filtered.map((event) => [
      event.id, event.action, event.detail, event.actor, event.type, event.status, event.time,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'agentpay-audit-logs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const counts = {
    total: events.length,
    blocked: events.filter((e) => e.status === 'Blocked').length,
    warnings: events.filter((e) => e.status === 'Warning').length,
    successful: events.filter((e) => e.status === 'Success').length,
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total events', value: counts.total, icon: FileText, color: 'text-signal' },
          { label: 'Successful', value: counts.successful, icon: ShieldCheck, color: 'text-safe' },
          { label: 'Blocked events', value: counts.blocked, icon: ShieldAlert, color: 'text-danger' },
          { label: 'Warnings', value: counts.warnings, icon: Bot, color: 'text-warn' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between text-sm text-muted">
              {item.label}<item.icon size={19} className={item.color} />
            </div>
            <p className={`mt-3 text-3xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs text-muted">Sample audit records</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">System activity history</h2>
            <p className="mt-1 text-xs text-muted">A searchable timeline of sample platform events.</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event, actor or ID..."
              className="w-full rounded-lg border border-line bg-raised py-2.5 pl-9 pr-3 text-sm text-text outline-none focus:border-signal" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-line bg-raised px-3 py-2.5 text-sm text-text outline-none focus:border-signal">
            {['All', 'Transaction', 'Security', 'Policy', 'Agent', 'System'].map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-3 py-3 font-medium">Event</th>
                <th className="px-3 py-3 font-medium">Actor</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-b border-line/70 last:border-0">
                  <td className="px-3 py-4">
                    <p className="font-medium">{event.action}</p>
                    <p className="mt-1 text-xs text-muted">{event.id} · {event.detail}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{event.actor}</td>
                  <td className="px-3 py-4 text-muted">{event.type}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusStyle[event.status]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-xs text-muted">{event.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">No matching audit events found.</p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">Showing {filtered.length} of {events.length} sample events.</p>
      </section>
      <p className="text-xs text-muted">Demo mode: these are sample records, not a persistent or tamper-proof audit trail.</p>
    </div>
  )
}
