import type { IncomingPayment } from './types';
import { formatMoney } from './format';

const quote = (value: string) => {
  // Treat cells as text if a spreadsheet could interpret them as formulas.
  const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
};
export function createDemoCsv(payments: readonly IncomingPayment[]): string {
  const rows = [
    ['Data type', 'Payment Reference', 'Amount USD', 'Customer', 'Invoice Allocation', 'Status'],
    ...payments.map(payment => ['Illustrative', payment.reference, formatMoney(payment.amountMinor).replace(/[$,]/g, ''), payment.customer, payment.invoiceAllocation, payment.status]),
  ];
  return rows.map(row => row.map(quote).join(',')).join('\r\n');
}
/** Local, fictional record download. This is not an ERP posting or approved batch. */
export function downloadDemoCsv(payments: readonly IncomingPayment[]): void {
  const url = URL.createObjectURL(new Blob(['\uFEFF', createDemoCsv(payments)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'verasett-illustrative-payments.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
