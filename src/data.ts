export type Risk = 'low' | 'medium' | 'high'
export type Status = 'approved' | 'blocked' | 'review'

export interface Transaction {
  id: string; agent: string; merchant: string; recipient: string; amount: number
  status: Status; risk: number; time: string; timestamp: string; reason: string
}
export interface Alert {
  id: string; title: string; detail: string; severity: Risk; time: string
}

export const stats = [
  { label: 'Payments screened', value: '12,847', change: '+8.2% vs last week', up: true },
  { label: 'Blocked', value: '342', change: '+3.1% vs last week', up: false },
  { label: 'Money protected', value: '$184,920', change: '+12.4% vs last week', up: true },
  { label: 'Average decision time', value: '38 ms', change: '-6 ms vs last week', up: true },
]

export const weekly = [
  { day: 'Mon', approved: 1720, blocked: 41 }, { day: 'Tue', approved: 1904, blocked: 52 },
  { day: 'Wed', approved: 1811, blocked: 47 }, { day: 'Thu', approved: 2103, blocked: 63 },
  { day: 'Fri', approved: 2236, blocked: 71 }, { day: 'Sat', approved: 1389, blocked: 38 },
  { day: 'Sun', approved: 1342, blocked: 30 },
]

export const agents = [
  { name: 'Procurement Agent', risk: 18 }, { name: 'Travel Booking Agent', risk: 34 },
  { name: 'Ad Spend Agent', risk: 67 }, { name: 'Vendor Payout Agent', risk: 82 },
]

const BASE = Date.parse('2026-11-13T10:30:00Z')
const ago = (m: number) => (m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} hr ago` : `${Math.round(m / 1440)} d ago`)

// Each row: id, agent, merchant, recipient, amount, status, risk, minutes ago, reason
type Row = [string, string, string, string, number, Status, number, number, string]
const rows: Row[] = [
  ['TX-90412', 'Procurement Agent', 'Cloudflare', 'cloudflare.com billing', 240, 'approved', 8, 2, 'Known vendor, amount within the usual monthly range.'],
  ['TX-90411', 'Vendor Payout Agent', 'Unknown wallet 0x7f3…c91', '0x7f3a…c91', 9800, 'blocked', 94, 6, 'New wallet never paid before, and the amount is 4x this agent\'s daily limit.'],
  ['TX-90410', 'Ad Spend Agent', 'Meta Ads', 'Meta Platforms, Inc.', 1450, 'review', 61, 14, 'Known vendor, but spend is 3x the agent\'s hourly average.'],
  ['TX-90409', 'Travel Booking Agent', 'Lufthansa', 'Deutsche Lufthansa AG', 812.4, 'approved', 22, 27, 'Matches an approved travel request for next week.'],
  ['TX-90408', 'Procurement Agent', 'AWS', 'Amazon Web Services', 3120, 'approved', 15, 41, 'Recurring cloud invoice, matches last month within 4%.'],
  ['TX-90407', 'Vendor Payout Agent', 'Northwind Supplies', 'Northwind Supplies Ltd', 5600, 'review', 73, 60, 'Bank details changed since the last payment to this vendor.'],
  ['TX-90406', 'Ad Spend Agent', 'Google Ads', 'Google LLC', 980, 'approved', 19, 95, 'Within the approved daily ad budget.'],
  ['TX-90405', 'Vendor Payout Agent', 'Unknown wallet 0x2b9…e04', '0x2b94…e04', 7400, 'blocked', 91, 130, 'Payee was changed by text hidden inside an invoice (possible prompt injection).'],
  ['TX-90404', 'Travel Booking Agent', 'Marriott', 'Marriott International', 1240, 'approved', 27, 180, 'Hotel booking linked to an approved trip.'],
  ['TX-90403', 'Procurement Agent', 'Staples', 'Staples Business Advantage', 410.75, 'approved', 11, 240, 'Small purchase from an approved supplier.'],
  ['TX-90402', 'Ad Spend Agent', 'LinkedIn Ads', 'LinkedIn Corporation', 2200, 'review', 58, 320, 'First payment to this ad platform above $2,000.'],
  ['TX-90401', 'Vendor Payout Agent', 'Orbit Logistics', 'Orbit Logistics GmbH', 12400, 'review', 79, 410, 'Amount is above the $10,000 limit for automatic approval.'],
  ['TX-90400', 'Procurement Agent', 'GitHub', 'GitHub, Inc.', 189, 'approved', 6, 520, 'Known vendor, seat count unchanged.'],
  ['TX-90399', 'Travel Booking Agent', 'Uber for Business', 'Uber Technologies', 96.3, 'approved', 12, 610, 'Small ride charge inside travel policy.'],
  ['TX-90398', 'Vendor Payout Agent', 'QuickSettle Exchange', '0x91c…7aa', 15000, 'blocked', 88, 800, 'Payee appears on a watchlist of high-risk exchanges.'],
  ['TX-90397', 'Ad Spend Agent', 'TikTok Ads', 'TikTok Pte. Ltd.', 1750, 'approved', 34, 1000, 'Within the weekly budget for this channel.'],
  ['TX-90396', 'Procurement Agent', 'Dell Technologies', 'Dell Inc.', 6420, 'approved', 29, 1300, 'Matches an approved purchase order.'],
  ['TX-90395', 'Travel Booking Agent', 'Booking.com', 'Booking.com B.V.', 2480, 'review', 52, 1500, 'Total is above the agent\'s $2,000 daily limit.'],
  ['TX-90394', 'Vendor Payout Agent', 'Northwind Supplies', 'Northwind Supplies Ltd', 5400, 'approved', 31, 1800, 'Known payee, bank details unchanged.'],
  ['TX-90393', 'Ad Spend Agent', 'Reddit Ads', 'Reddit, Inc.', 640, 'approved', 16, 2100, 'Small spend inside the approved budget.'],
  ['TX-90392', 'Procurement Agent', 'Unknown vendor "TechPrime"', 'techprime-pay.io', 4300, 'blocked', 86, 2500, 'Vendor is not in the approved list and the domain was registered 3 days ago.'],
  ['TX-90391', 'Travel Booking Agent', 'Emirates', 'Emirates Airline', 3150, 'approved', 25, 2900, 'Matches an approved travel request.'],
]
export const transactions: Transaction[] = rows.map(([id, agent, merchant, recipient, amount, status, risk, m, reason]) => ({
  id, agent, merchant, recipient, amount, status, risk, reason,
  time: ago(m), timestamp: new Date(BASE - m * 60000).toISOString(),
}))

export const statusLabel: Record<Status, string> = { approved: 'Approved', blocked: 'Blocked', review: 'Needs review' }

export const alerts: Alert[] = [
  { id: 'AL-31', title: 'Payment to a new, unverified wallet', detail: 'Vendor Payout Agent tried to send $9,800 to a wallet never seen before. Blocked.', severity: 'high', time: '6 min ago' },
  { id: 'AL-30', title: 'Spending spike', detail: 'Ad Spend Agent spent 3x its daily average in one hour.', severity: 'medium', time: '14 min ago' },
  { id: 'AL-29', title: 'Possible prompt injection', detail: 'An invoice contained hidden text telling an agent to change a payee.', severity: 'high', time: '2 hr ago' },
  { id: 'AL-28', title: 'Daily limit at 80%', detail: 'Travel Booking Agent is close to its $2,000 limit.', severity: 'low', time: '3 hr ago' },
]

export const riskLevel = (score: number): Risk => (score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low')
export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// ---- Phase 3: agent wallets (demo only, no real wallets or blockchain) ----
export type AgentStatus = 'active' | 'suspended'
export interface AgentProfile {
  id: string; name: string; type: string; wallet: string; risk: number
  dailyLimit: number; monthlyLimit: number; spentToday: number; spentMonth: number
  status: AgentStatus; allowlist: string[]
}
export const agentTypes = ['Procurement', 'Travel', 'Advertising', 'Vendor payout', 'Payroll', 'Other']

export const agentProfiles: AgentProfile[] = [
  { id: 'AG-01', name: 'Procurement Agent', type: 'Procurement', wallet: '0x4a7c1e90b2d83f5a6c19e07b3d48a2f1c5e6b903', risk: 18, dailyLimit: 5000, monthlyLimit: 60000, spentToday: 3360, spentMonth: 38420, status: 'active', allowlist: ['Cloudflare', 'AWS', 'GitHub', 'Staples', 'Dell Technologies'] },
  { id: 'AG-02', name: 'Travel Booking Agent', type: 'Travel', wallet: '0x9be2d4057a1c63f8e0b5a79d2c41f86e3a0d57b1', risk: 34, dailyLimit: 2000, monthlyLimit: 25000, spentToday: 1620, spentMonth: 14780, status: 'active', allowlist: ['Lufthansa', 'Marriott', 'Emirates', 'Uber for Business', 'Booking.com'] },
  { id: 'AG-03', name: 'Ad Spend Agent', type: 'Advertising', wallet: '0x13f85ac6e7d092b4a1c3589ef06d27b4a8c1e35f', risk: 67, dailyLimit: 3000, monthlyLimit: 40000, spentToday: 2430, spentMonth: 33900, status: 'active', allowlist: ['Meta Ads', 'Google Ads', 'LinkedIn Ads', 'TikTok Ads', 'Reddit Ads'] },
  { id: 'AG-04', name: 'Vendor Payout Agent', type: 'Vendor payout', wallet: '0xc60d92e1b4a73f58d0e6a21c97b3f45082de1a76', risk: 82, dailyLimit: 10000, monthlyLimit: 120000, spentToday: 5600, spentMonth: 97200, status: 'suspended', allowlist: ['Northwind Supplies', 'Orbit Logistics'] },
  { id: 'AG-05', name: 'Payroll Agent', type: 'Payroll', wallet: '0x58a3f0c9e2b71d46a8e5c03f17d9b624e0a8c2d4', risk: 12, dailyLimit: 20000, monthlyLimit: 150000, spentToday: 0, spentMonth: 84500, status: 'active', allowlist: ['Gusto Payroll', 'Deel'] },
]
