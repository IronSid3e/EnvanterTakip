const API_BASE_URL = "http://localhost:5279/api";

export const ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  productsById: (id: number) => `${API_BASE_URL}/products/${id}`,
  productsByBarcode: (barcode: string) =>
    `${API_BASE_URL}/products/barcode/${encodeURIComponent(barcode)}`,
  productsCategories: `${API_BASE_URL}/products/categories`,
  sales: `${API_BASE_URL}/sales`,
  salesById: (id: number) => `${API_BASE_URL}/sales/${id}`,
  salesDashboard: `${API_BASE_URL}/sales/dashboard`,
  customers: `${API_BASE_URL}/customers`,
  customersById: (id: number) => `${API_BASE_URL}/customers/${id}`,
  invoices: `${API_BASE_URL}/invoices`,
  invoicesById: (id: number) => `${API_BASE_URL}/invoices/${id}`,
  invoicesPdf: (id: number) => `${API_BASE_URL}/invoices/${id}/pdf`,
  invoicesStatus: (id: number) => `${API_BASE_URL}/invoices/${id}/status`,
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  barcode: string | null;
  stock: number;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  saleDate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockCount: number;
  todaySalesCount: number;
  recentSales: {
    id: number;
    productName: string;
    sellerName: string;
    quantity: number;
    saleDate: string;
  }[];
  topSellingProducts: {
    productId: number;
    productName: string;
    totalSold: number;
  }[];
}

export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface SaleFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  productId?: number;
  startDate?: string;
  endDate?: string;
  sellerName?: string;
}

export interface Customer {
  id: number;
  type: string;
  name: string;
  taxNumber: string | null;
  taxOffice: string | null;
  nationalId: string | null;
  address: string | null;
  phone: string | null;
  createdAt: string;
}

export interface CustomerFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  type?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  saleId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  saleTotalPrice: number;
  customerId: number;
  customerName: string;
  customerType: string;
  customerTaxNumber: string | null;
  customerTaxOffice: string | null;
  customerNationalId: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
  invoiceDate: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface InvoiceFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  status?: string;
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      message: (data as ApiResponse<T>).message || "Bir hata oluştu.",
      data: (data as ApiResponse<T>).data as T,
      errors: (data as ApiResponse<T>).errors || [],
    };
  }
  return data as ApiResponse<T>;
}

function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }
  return `?${searchParams.toString()}`;
}

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const qs = params ? buildQueryString(params) : "";
  const response = await fetch(`${url}${qs}`);
  return handleResponse<T>(response);
}

export async function apiPost<T>(
  url: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(
  url: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url, { method: "DELETE" });
  return handleResponse<T>(response);
}
