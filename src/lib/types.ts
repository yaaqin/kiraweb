export type Role = "SUPERADMIN" | "ADMIN";
export type Category =
  | "HAIRCUT"
  | "COLORING"
  | "SMOOTHING"
  | "CREAMBATH"
  | "HAIRSTYLING"
  | "ADDONS"
  | "RETAIL";
export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthSession {
  accessToken: string;
  user: SessionUser;
}

export interface AdminUser extends SessionUser {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  category: Category;
  price: number;
  duration: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface TransactionItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export interface Transaction {
  id: number;
  code: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  voucherCode: string | null;
  paymentMethod: PaymentMethod;
  cashReceived: number | null;
  createdAt: string;
  items: TransactionItem[];
  cashier: { id: number; name: string } | null;
}

export interface SalesSummary {
  revenue: number;
  orders: number;
  topItem: string | null;
  paymentBreakdown: Record<PaymentMethod, number>;
}

export type FinanceRange = "today" | "week" | "month" | "all";
export type LedgerKind = "SALE" | "EXPENSE" | "PETTY_CASH";

export interface LedgerEntry {
  kind: LedgerKind;
  id: number;
  ref: string;
  date: string;
  description: string;
  account: PaymentMethod;
  debit: number;
  credit: number;
  pic: string | null;
}

export interface FinanceReport {
  range: FinanceRange;
  balances: Record<PaymentMethod, number>;
  period: {
    revenue: number;
    revenueByMethod: Record<PaymentMethod, number>;
    expenses: number;
    pettyCash: number;
  };
  ledger: LedgerEntry[];
  trend: { date: string; revenue: number; expenses: number }[];
}
