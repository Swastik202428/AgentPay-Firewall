import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar, { pages, type PageId } from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Agents from './components/Agents'
import RiskEngine from './components/RiskEngine'
import Alerts from './components/Alerts'
import Policies from './components/Policies'
import AuditLogs from './components/AuditLogs'
import Settings from './components/Settings'
import DemoSimulator from './components/DemoSimulator'

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard')
  const [open, setOpen] = useState(false)
  const current = pages.find((p) => p.id === page)!

  return (
    <div className="min-h-screen">
      <Sidebar active={page} onSelect={setPage} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-ink/85 px-4 py-4 backdrop-blur sm:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="text-muted lg:hidden"><Menu size={22} /></button>
          <div>
            <h1 className="text-xl font-bold">{current.label}</h1>
            <p className="text-xs text-muted">Every payment your AI agents make, checked before it leaves.</p>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          {page === 'dashboard' ? <Dashboard />
            : page === 'transactions' ? <Transactions />
            : page === 'agents' ? <Agents />
            : page === 'risk-engine' ? <RiskEngine />
            : page === 'alerts' ? <Alerts />
            : page === 'policies' ? <Policies />
            : page === 'audit-logs' ? <AuditLogs />
            : page === 'settings' ? <Settings /> : page === 'demo-simulator' ? <DemoSimulator />
            : (
              <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
                The {current.label} page is not built yet. It comes in a later phase.
              </div>
            )}
        </main>
      </div>
    </div>
  )
}


