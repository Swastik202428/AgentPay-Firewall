import { ClipboardList, LayoutDashboard, ArrowLeftRight, Bot, ShieldAlert, ScrollText, Settings, ShieldCheck, X, ScanSearch, PlayCircle } from 'lucide-react'

export const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'risk-engine', label: 'Risk Engine', icon: ScanSearch },
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { id: 'policies', label: 'Policies', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'demo-simulator', label: 'Demo Simulator', icon: PlayCircle },
] as const

export type PageId = (typeof pages)[number]['id']

interface Props {
  active: PageId
  onSelect: (id: PageId) => void
  open: boolean
  onClose: () => void
}

export default function Sidebar({ active, onSelect, open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-panel p-4 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-signal/15 text-signal"><ShieldCheck size={20} /></span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold">AgentPay</p>
              <p className="text-xs text-muted">Firewall</p>
            </div>
          </div>
          <button aria-label="Close menu" onClick={onClose} className="text-muted lg:hidden"><X size={20} /></button>
        </div>
        <nav className="min-h-0 flex-1 flex flex-col gap-1 overflow-y-auto">
          {pages.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { onSelect(id); onClose() }}
              aria-current={active === id ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active === id ? 'bg-signal/12 text-signal' : 'text-muted hover:bg-raised hover:text-text'}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-line bg-raised p-3 text-xs text-muted">
          <p className="mb-1 flex items-center gap-2 font-semibold text-text"><span className="h-2 w-2 rounded-full bg-safe" />Firewall active</p>
          Demo mode. All data is sample data.
        </div>
      </aside>
    </>
  )
}



