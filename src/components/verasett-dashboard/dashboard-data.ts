/** Fictional USD records for the isolated visual demo. No bank or ERP connection. */
export type DashboardTransactionStatus = 'Matched' | 'Needs review' | 'Evidence pending';
export type DashboardDate = `${number}-${number}-${number}`;

export interface DashboardTransaction {
  id: string;
  reference: string;
  customer: string;
  /** Integer cents. */
  amountMinor: number;
  status: DashboardTransactionStatus;
  date: DashboardDate;
  source: 'ACH' | 'Wire';
  account: 'Operating' | 'Collections';
  invoiceCount: number;
  /** Matched allocations or unapproved candidate invoices, as identified by status and note. */
  invoices: { reference: string; amountMinor: number }[];
  note: string;
}

export const dashboardTransactions: DashboardTransaction[] = [
  {
    id: 'DEMO-P001', reference: 'ACH-78421', customer: 'Acme Distribution', amountMinor: 1245000,
    status: 'Matched', date: '2026-10-29', source: 'ACH', account: 'Operating', invoiceCount: 3,
    invoices: [{ reference: 'INV-1042', amountMinor: 800000 }, { reference: 'INV-1048', amountMinor: 300000 }, { reference: 'INV-1051', amountMinor: 145000 }],
    note: 'Payment total equals selected open invoices. Illustrative match; no ERP posting.',
  },
  {
    id: 'DEMO-P002', reference: 'WIRE-99302', customer: 'Global Supply Co.', amountMinor: 875000,
    status: 'Matched', date: '2026-10-29', source: 'Wire', account: 'Collections', invoiceCount: 2,
    invoices: [{ reference: 'INV-2081', amountMinor: 500000 }, { reference: 'INV-2084', amountMinor: 375000 }],
    note: 'Payment total equals selected open invoices. Illustrative match; no ERP posting.',
  },
  {
    id: 'DEMO-P003', reference: 'ACH-55231', customer: 'Westline Trading', amountMinor: 432000,
    status: 'Needs review', date: '2026-10-28', source: 'ACH', account: 'Operating', invoiceCount: 2,
    invoices: [{ reference: 'INV-3052', amountMinor: 300000 }, { reference: 'INV-3056', amountMinor: 157000 }],
    note: 'Remittance amount differs from open invoices. Candidate invoices total $4,570.00; a claimed $250.00 deduction is unverified and requires human review.',
  },
  {
    id: 'DEMO-P004', reference: 'WIRE-77120', customer: 'Orion Wholesale', amountMinor: 1592000,
    status: 'Matched', date: '2026-10-28', source: 'Wire', account: 'Collections', invoiceCount: 5,
    invoices: [{ reference: 'INV-4120', amountMinor: 310000 }, { reference: 'INV-4123', amountMinor: 295000 }, { reference: 'INV-4127', amountMinor: 327000 }, { reference: 'INV-4130', amountMinor: 410000 }, { reference: 'INV-4134', amountMinor: 250000 }],
    note: 'Payment total equals selected open invoices. Illustrative match; no ERP posting.',
  },
  {
    id: 'DEMO-P005', reference: 'ACH-62108', customer: 'Harbor Parts', amountMinor: 680000,
    status: 'Evidence pending', date: '2026-10-27', source: 'ACH', account: 'Operating', invoiceCount: 2,
    invoices: [{ reference: 'INV-5104', amountMinor: 430000 }, { reference: 'INV-5108', amountMinor: 275000 }],
    note: 'Fictional fixture. Candidate invoices total $7,050.00. Evidence for the claimed $250.00 short payment is pending; no deduction has been approved.',
  },
  {
    id: 'DEMO-P006', reference: 'ACH-43819', customer: 'Cedar Industrial', amountMinor: 217500,
    status: 'Needs review', date: '2026-10-27', source: 'ACH', account: 'Collections', invoiceCount: 2,
    invoices: [{ reference: 'INV-6121', amountMinor: 112500 }, { reference: 'INV-6124', amountMinor: 110000 }],
    note: 'Fictional fixture. Received amount is $50.00 below the candidate invoice total. Human review required; no adjustment has been applied.',
  },
  {
    id: 'DEMO-P007', reference: 'ACH-81642', customer: 'Summit Packaging', amountMinor: 345000,
    status: 'Matched', date: '2026-10-26', source: 'ACH', account: 'Operating', invoiceCount: 2,
    invoices: [{ reference: 'INV-7010', amountMinor: 180000 }, { reference: 'INV-7013', amountMinor: 165000 }],
    note: 'Fictional fixture. Payment total equals selected open invoices; no ERP posting.',
  },
  {
    id: 'DEMO-P008', reference: 'WIRE-60418', customer: 'Delta Equipment', amountMinor: 930000,
    status: 'Matched', date: '2026-10-25', source: 'Wire', account: 'Collections', invoiceCount: 3,
    invoices: [{ reference: 'INV-8102', amountMinor: 320000 }, { reference: 'INV-8105', amountMinor: 300000 }, { reference: 'INV-8109', amountMinor: 310000 }],
    note: 'Fictional fixture. Payment total equals selected open invoices; no ERP posting.',
  },
  {
    id: 'DEMO-P009', reference: 'ACH-90533', customer: 'Atlas Components', amountMinor: 562500,
    status: 'Matched', date: '2026-10-24', source: 'ACH', account: 'Operating', invoiceCount: 2,
    invoices: [{ reference: 'INV-9021', amountMinor: 312500 }, { reference: 'INV-9024', amountMinor: 250000 }],
    note: 'Fictional fixture. Payment total equals selected open invoices; no ERP posting.',
  },
  {
    id: 'DEMO-P010', reference: 'WIRE-38126', customer: 'Beacon Materials', amountMinor: 487000,
    status: 'Matched', date: '2026-10-23', source: 'Wire', account: 'Collections', invoiceCount: 2,
    invoices: [{ reference: 'INV-10011', amountMinor: 237000 }, { reference: 'INV-10014', amountMinor: 250000 }],
    note: 'Fictional fixture. Payment total equals selected open invoices; no ERP posting.',
  },
  {
    id: 'DEMO-P011', reference: 'ACH-26754', customer: 'Redwood Logistics', amountMinor: 775000,
    status: 'Matched', date: '2026-10-22', source: 'ACH', account: 'Operating', invoiceCount: 3,
    invoices: [{ reference: 'INV-11002', amountMinor: 250000 }, { reference: 'INV-11006', amountMinor: 300000 }, { reference: 'INV-11009', amountMinor: 225000 }],
    note: 'Fictional fixture. Payment total equals selected open invoices; no ERP posting.',
  },
  {
    id: 'DEMO-P012', reference: 'WIRE-51980', customer: 'Birch Manufacturing', amountMinor: 298000,
    status: 'Needs review', date: '2026-10-20', source: 'Wire', account: 'Collections', invoiceCount: 1,
    invoices: [{ reference: 'INV-12031', amountMinor: 310000 }],
    note: 'Fictional fixture. Received amount is $120.00 below the candidate invoice total. Review required; the invoice remains open.',
  },
];

export interface DashboardFilters {
  query: string;
  period: 'week' | 'month' | 'all';
  accounts: readonly string[];
  statuses: readonly string[];
  sources: readonly string[];
}

/** Periods are fixed to the illustrative dashboard's as-of date, 29 October 2026. */
export function filterTransactions(rows: readonly DashboardTransaction[], filters: DashboardFilters): DashboardTransaction[] {
  const query = filters.query.trim().toLocaleLowerCase('en-US');
  const start = filters.period === 'week' ? '2026-10-23' : '2026-10-01';
  return rows.filter(row => {
    if (filters.period !== 'all' && (row.date < start || row.date > '2026-10-29')) return false;
    if (filters.accounts.length && !filters.accounts.includes(row.account)) return false;
    if (filters.statuses.length && !filters.statuses.includes(row.status)) return false;
    if (filters.sources.length && !filters.sources.includes(row.source)) return false;
    const searchable = [row.reference, row.customer, ...row.invoices.map(invoice => invoice.reference)].join(' ').toLocaleLowerCase('en-US');
    return !query || searchable.includes(query);
  });
}

/** Review totals include Evidence pending, which is still unresolved. Match rate is a count percentage. */
export function getDashboardSummary(rows: readonly DashboardTransaction[]) {
  let receivedMinor = 0, matchedMinor = 0, reviewMinor = 0, matchedCount = 0;
  for (const row of rows) {
    receivedMinor += row.amountMinor;
    if (row.status === 'Matched') {
      matchedMinor += row.amountMinor;
      matchedCount += 1;
    } else reviewMinor += row.amountMinor;
  }
  return {
    receivedMinor, matchedMinor, reviewMinor,
    matchRate: rows.length ? matchedCount / rows.length * 100 : 0,
    matchedCount, reviewCount: rows.length - matchedCount, totalCount: rows.length,
  };
}

/** Always returns the seven chart buckets Oct 23–29; older and future rows are excluded. */
export function dailyReceipts(rows: readonly DashboardTransaction[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = index + 23;
    const date: DashboardDate = `2026-10-${day}`;
    const dayRows = rows.filter(row => row.date === date);
    const summary = getDashboardSummary(dayRows);
    return { date, label: `Oct ${day}`, receivedMinor: summary.receivedMinor, matchedMinor: summary.matchedMinor };
  });
}
