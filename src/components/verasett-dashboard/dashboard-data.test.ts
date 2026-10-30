import { describe, expect, it } from 'vitest';
import { dailyReceipts, dashboardTransactions, filterTransactions, getDashboardSummary, type DashboardFilters, type DashboardTransaction } from './dashboard-data';

const filters: DashboardFilters = { query: '', period: 'all', accounts: [], statuses: [], sources: [] };

describe('illustrative dashboard records', () => {
  it('preserves the four incoming payment records and exact integer-cent allocations', () => {
    expect(dashboardTransactions.slice(0, 4).map(row => [row.reference, row.customer, row.amountMinor, row.status, row.invoiceCount])).toEqual([
      ['ACH-78421', 'Acme Distribution', 1245000, 'Matched', 3],
      ['WIRE-99302', 'Global Supply Co.', 875000, 'Matched', 2],
      ['ACH-55231', 'Westline Trading', 432000, 'Needs review', 2],
      ['WIRE-77120', 'Orion Wholesale', 1592000, 'Matched', 5],
    ]);
    for (const row of dashboardTransactions) {
      expect(Number.isSafeInteger(row.amountMinor)).toBe(true);
      expect(row.invoiceCount).toBe(row.invoices.length);
      expect(new Set(row.invoices.map(invoice => invoice.reference)).size).toBe(row.invoiceCount);
      if (row.status === 'Matched') expect(row.invoices.reduce((sum, invoice) => sum + invoice.amountMinor, 0)).toBe(row.amountMinor);
    }
    expect(new Set(dashboardTransactions.map(row => row.id)).size).toBe(dashboardTransactions.length);
  });

  it('keeps unsupported deductions unresolved and candidate invoices distinct from received cash', () => {
    const westline = dashboardTransactions.find(row => row.reference === 'ACH-55231')!;
    expect(westline.invoices.reduce((sum, invoice) => sum + invoice.amountMinor, 0)).toBe(457000);
    expect(westline.status).toBe('Needs review');
    expect(westline.note).toContain('claimed $250.00 deduction is unverified');
    expect(dashboardTransactions.find(row => row.customer === 'Harbor Parts')?.status).toBe('Evidence pending');
    expect(dashboardTransactions.find(row => row.customer === 'Cedar Industrial')?.amountMinor).toBe(217500);
  });
});

describe('dashboard filtering', () => {
  it('treats empty multi-selects as all and leaves the source array intact', () => {
    const originalOrder = dashboardTransactions.map(row => row.reference);
    expect(filterTransactions(dashboardTransactions, filters)).toEqual(dashboardTransactions);
    expect(filterTransactions(dashboardTransactions, filters)).not.toBe(dashboardTransactions);
    expect(dashboardTransactions.map(row => row.reference)).toEqual(originalOrder);
  });

  it('combines account, status, source, period, and a trimmed case-insensitive query', () => {
    const result = filterTransactions(dashboardTransactions, {
      query: '  DISTRIBUTION  ', period: 'week', accounts: ['Operating'], statuses: ['Matched'], sources: ['ACH'],
    });
    expect(result.map(row => row.reference)).toEqual(['ACH-78421']);
    expect(filterTransactions(dashboardTransactions, { ...filters, sources: ['Wire'], statuses: ['Evidence pending'] })).toEqual([]);
  });

  it('finds references, customers, and traceable invoice references', () => {
    expect(filterTransactions(dashboardTransactions, { ...filters, query: 'wire-99302' }).map(row => row.customer)).toEqual(['Global Supply Co.']);
    expect(filterTransactions(dashboardTransactions, { ...filters, query: 'INV-3056' }).map(row => row.reference)).toEqual(['ACH-55231']);
    expect(filterTransactions(dashboardTransactions, { ...filters, query: 'not a customer' })).toEqual([]);
  });

  it('includes week boundaries and month-to-date while excluding future and prior-month records', () => {
    const base = dashboardTransactions[0];
    const boundaryRows: DashboardTransaction[] = [
      { ...base, id: 'before-month', date: '2026-09-30' },
      { ...base, id: 'month-start', date: '2026-10-01' },
      { ...base, id: 'before-week', date: '2026-10-22' },
      { ...base, id: 'week-start', date: '2026-10-23' },
      { ...base, id: 'as-of', date: '2026-10-29' },
      { ...base, id: 'future', date: '2026-10-30' },
    ];
    expect(filterTransactions(boundaryRows, { ...filters, period: 'week' }).map(row => row.id)).toEqual(['week-start', 'as-of']);
    expect(filterTransactions(boundaryRows, { ...filters, period: 'month' }).map(row => row.id)).toEqual(['month-start', 'before-week', 'week-start', 'as-of']);
    expect(filterTransactions(boundaryRows, filters)).toHaveLength(6);
    expect(filterTransactions(dashboardTransactions, { ...filters, period: 'week' })).toHaveLength(10);
  });
});

describe('dashboard financial summaries', () => {
  it('partitions received amounts without treating evidence pending as matched', () => {
    const summary = getDashboardSummary(dashboardTransactions);
    expect(summary).toMatchObject({ receivedMinor: 8439000, matchedMinor: 6811500, reviewMinor: 1627500, matchedCount: 8, reviewCount: 4, totalCount: 12 });
    expect(summary.receivedMinor).toBe(summary.matchedMinor + summary.reviewMinor);
    expect(summary.matchRate).toBeCloseTo(8 / 12 * 100);
    const pending = getDashboardSummary(dashboardTransactions.filter(row => row.status === 'Evidence pending'));
    expect(pending).toMatchObject({ matchedMinor: 0, reviewMinor: 680000, matchRate: 0, reviewCount: 1 });
  });

  it('uses filtered records and produces zero-safe empty summaries', () => {
    const week = getDashboardSummary(filterTransactions(dashboardTransactions, { ...filters, period: 'week' }));
    expect(week).toMatchObject({ receivedMinor: 7366000, matchedMinor: 6036500, reviewMinor: 1329500, matchedCount: 7, reviewCount: 3, totalCount: 10, matchRate: 70 });
    expect(getDashboardSummary([])).toEqual({ receivedMinor: 0, matchedMinor: 0, reviewMinor: 0, matchedCount: 0, reviewCount: 0, totalCount: 0, matchRate: 0 });
  });

  it('returns exactly seven chronological daily buckets with week-only sums', () => {
    const days = dailyReceipts(dashboardTransactions);
    expect(days.map(day => day.date)).toEqual(['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']);
    expect(days.map(day => day.receivedMinor)).toEqual([487000, 562500, 930000, 345000, 897500, 2024000, 2120000]);
    expect(days.reduce((sum, day) => sum + day.receivedMinor, 0)).toBe(7366000);
    expect(days.reduce((sum, day) => sum + day.matchedMinor, 0)).toBe(6036500);
    expect(days[4].matchedMinor).toBe(0);
    expect(dailyReceipts([])).toHaveLength(7);
    expect(dailyReceipts([]).every(day => day.receivedMinor === 0 && day.matchedMinor === 0)).toBe(true);
  });
});
