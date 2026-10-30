import type { CSSProperties } from 'react';

export interface AssetProps { className?: string; style?: CSSProperties }
export type PaymentStatus = 'Matched' | 'Review' | 'Needs review' | 'Pending' | 'Evidence pending' | 'Export ready' | 'Blocked';
/** Fictional USD display data. amountMinor is a safe integer in cents. */
export interface Payment { reference: string; amountMinor: number; customer: string; status: PaymentStatus }
export interface InvoiceAllocation { reference: string; amountMinor: number }
export interface PaymentMatch { reference: string; amountMinor: number; invoices: readonly InvoiceAllocation[] }
export interface IncomingPayment extends Payment { invoiceAllocation: string }
