import { riskLevel } from '../data'

export const riskColor = { low: 'var(--color-safe)', medium: 'var(--color-warn)', high: 'var(--color-danger)' }

export default function RiskGauge({ score, size = 168 }: { score: number; size?: number }) {
  const r = size / 2 - 12, c = 2 * Math.PI * r
  const color = riskColor[riskLevel(score)]
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Overall risk score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-extrabold tabular-nums">{score}</p>
        <p className="text-xs text-muted">out of 100</p>
      </div>
    </div>
  )
}
