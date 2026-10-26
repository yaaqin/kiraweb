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
