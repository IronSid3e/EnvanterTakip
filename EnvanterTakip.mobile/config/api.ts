import Constants from "expo-constants";

const API_IP = "192.168.1.243";
const API_PORT = 5279;

export const API_BASE_URL = `http://${API_IP}:${API_PORT}/api`;

export const ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  productsById: (id: number) => `${API_BASE_URL}/products/${id}`,
  productsByBarcode: (barcode: string) =>
    `${API_BASE_URL}/products/barcode/${encodeURIComponent(barcode)}`,
  productsCategories: `${API_BASE_URL}/products/categories`,
  sales: `${API_BASE_URL}/sales`,
  salesById: (id: number) => `${API_BASE_URL}/sales/${id}`,
  salesDashboard: `${API_BASE_URL}/sales/dashboard`,
  stockEntries: `${API_BASE_URL}/stockentries`,
  stockEntriesById: (id: number) => `${API_BASE_URL}/stockentries/${id}`,
  customers: `${API_BASE_URL}/customers`,
  customersById: (id: number) => `${API_BASE_URL}/customers/${id}`,
  invoices: `${API_BASE_URL}/invoices`,
  invoicesById: (id: number) => `${API_BASE_URL}/invoices/${id}`,
  invoicesPdf: (id: number) => `${API_BASE_URL}/invoices/${id}/pdf`,
  invoicesStatus: (id: number) => `${API_BASE_URL}/invoices/${id}/status`,
};

// API Response tipleri
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

export interface StockEntry {
  id: number;
  productId: number;
  productName: string;
  supplierName: string;
  quantity: number;
  entryDate: string;
  note: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockCount: number;
  todaySalesCount: number;
  recentSales: Sale[];
  topSellingProducts: {
    productId: number;
    productName: string;
    totalSold: number;
  }[];
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

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
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
