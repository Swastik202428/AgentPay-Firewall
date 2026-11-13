import { useState } from 'react'
import { Play, RotateCcw, ShieldCheck, ShieldAlert, Activity, Wallet } from 'lucide-react'

const scenarios = [
  {
    id: 'safe',
    title: 'Normal Vendor Payment',
    description: 'Known vendor, verified wallet and normal transaction amount.',
    merchant: 'Northwind Supplies',
    recipient: 'Verified Wallet',
    amount: 450,
    risk: 12,
    decision: 'APPROVED',
    factors: ['Known merchant', 'Verified recipient', 'Within spending limit'],
  },
  {
    id: 'wallet',
    title: 'Unknown Wallet Attack',
    description: 'High-value payment to an unverified wallet address.',
    merchant: 'Unknown Vendor',
    recipient: 'Unverified Wallet',
    amount: 9800,
    risk: 94,
    decision: 'BLOCKED',
    factors: ['Unknown wallet address', 'High transaction amount', 'Unusual payment behavior'],
  },
  {
    id: 'injection',
    title: 'Invoice Prompt Injection',
    description: 'Invoice contains suspicious instructions attempting to manipulate an AI agent.',
    merchant: 'Suspicious Invoice',
    recipient: 'External Wallet',
    amount: 7400,
    risk: 91,
    decision: 'BLOCKED',
    factors: ['Suspicious invoice instructions', 'Untrusted external content', 'High-risk payment request'],
  },
] as const

type Scenario = typeof scenarios[number]

export default function DemoSimulator() {
  const [selected, setSelected] = useState<Scenario['id']>('safe')
  const [result, setResult] = useState<Scenario | null>(null)

  const active = scenarios.find((scenario) => scenario.id === selected)!

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-signal text-sm font-semibold">
          <Activity size={16} /> LIVE DEMONSTRATION
        </div>
        <h1 className="mt-2 text-2xl font-bold">Payment Security Simulator</h1>
        <p className="mt-1 text-sm text-muted">Run controlled scenarios to demonstrate AgentPay Firewall's risk decisions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => {
              setSelected(scenario.id)
              setResult(null)
            }}
            className={`rounded-xl border p-5 text-left transition ${
              selected === scenario.id
                ? 'border-signal bg-signal/10'
                : 'border-line bg-panel hover:border-signal/50'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <Wallet size={20} className="text-signal" />
              <span className="text-xs text-muted">SCENARIO</span>
            </div>
            <h3 className="font-semibold">{scenario.title}</h3>
            <p className="mt-2 text-sm text-muted">{scenario.description}</p>
            <p className="mt-4 text-sm font-semibold">{scenario.decision} · Risk {scenario.risk}/100</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold">Selected Transaction</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted">MERCHANT</p>
            <p className="mt-1 font-medium">{active.merchant}</p>
          </div>
          <div>
            <p className="text-xs text-muted">RECIPIENT</p>
            <p className="mt-1 font-medium">{active.recipient}</p>
          </div>
          <div>
            <p className="text-xs text-muted">AMOUNT</p>
            <p className="mt-1 font-mono font-semibold">${active.amount.toLocaleString('en-US')}</p>
          </div>
          <div>
            <p className="text-xs text-muted">RISK SCORE</p>
            <p className="mt-1 font-mono font-semibold">{active.risk}/100</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setResult(active)}
            className="flex items-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            <Play size={16} /> Run Simulation
          </button>
          <button
            onClick={() => setResult(null)}
            className="flex items-center gap-2 rounded-lg border border-line px-5 py-3 text-sm hover:bg-raised"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-xl border border-line bg-panel p-6">
          <div className="flex items-center gap-3">
            {result.decision === 'APPROVED'
              ? <ShieldCheck className="text-safe" size={28} />
              : <ShieldAlert className="text-danger" size={28} />}
            <div>
              <p className="text-xs text-muted">SIMULATION RESULT</p>
              <h2 className={`text-xl font-bold ${result.decision === 'APPROVED' ? 'text-safe' : 'text-danger'}`}>
                PAYMENT {result.decision}
              </h2>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted">Risk assessment</span>
              <span className="font-mono font-semibold">{result.risk}/100</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-raised">
              <div
                className={`h-full rounded-full ${result.risk >= 70 ? 'bg-danger' : result.risk >= 40 ? 'bg-warn' : 'bg-safe'}`}
                style={{ width: `${result.risk}%` }}
              />
            </div>
          </div>

          <h3 className="mt-6 font-semibold">Risk Factors</h3>
          <ul className="mt-3 space-y-2">
            {result.factors.map((factor) => (
              <li key={factor} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-signal">•</span> {factor}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-lg bg-raised p-3 text-xs text-muted">
            Demo only: this result is generated from predefined scenarios and does not execute or block a real payment.
          </p>
        </div>
      )}
    </div>
  )
}
