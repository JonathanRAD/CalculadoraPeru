import { QuoteItemInput, QuoteCalculatedItem, QuoteTotals, QuoteStatus, UnitType, DiscountType } from '@/core/calculators/quote';
import { ClientRecord } from '@/server/repositories/client.repository';
import { CatalogItemRecord } from '@/server/repositories/catalog.repository';
import { QuoteRecord, QuoteItemRecord } from '@/server/repositories/quote.repository';

export type {
  QuoteItemInput,
  QuoteCalculatedItem,
  QuoteTotals,
  QuoteStatus,
  UnitType,
  DiscountType,
  ClientRecord,
  CatalogItemRecord,
  QuoteRecord,
  QuoteItemRecord,
};

export interface QuoteFormState {
  id?: string;
  prefix: string;
  quoteNumber?: string;
  clientId?: string;
  clientName: string;
  clientDocType: 'none' | 'dni' | 'ruc' | 'other';
  clientDocNumber: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  validUntil: string;
  items: QuoteItemInput[];
  includeIgv: boolean;
  igvRate: number;
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  paymentTerms: string;
  deliveryTime: string;
  publicNotes: string;
  internalNotes: string;
  status: QuoteStatus;
}
