import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  apiDelete,
  apiPut,
  type PaginatedResponse,
  type Invoice,
  type InvoiceFilterParams,
} from "../config/api";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  Draft: { label: "Taslak", color: "#6c757d", bg: "#f1f3f5" },
  Sent: { label: "Gönderildi", color: "#0d6efd", bg: "#e0f2fe" },
  Paid: { label: "Ödendi", color: "#198754", bg: "#f0fdf4" },
  Cancelled: { label: "İptal", color: "#dc3545", bg: "#fef2f2" },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<InvoiceFilterParams>({
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "invoiceDate",
    sortDescending: true,
    status: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, unknown> = { ...filters };
    if (params.search === "") delete params.search;
    if (params.status === "") delete params.status;
    if (params.startDate === "") delete params.startDate;
    if (params.endDate === "") delete params.endDate;

    apiGet<PaginatedResponse<Invoice>>(ENDPOINTS.invoices, params).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setInvoices(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
        setError("");
      } else {
        setError(res.message);
      }
    });
    return () => { cancelled = true; };
  }, [filters, refreshKey]);

  const updateFilter = (key: keyof InvoiceFilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
    const res = await apiPut<unknown>(ENDPOINTS.invoicesStatus(invoice.id), { status: newStatus });
    if (res.success) triggerRefresh();
    else alert(res.message);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`"${invoice.invoiceNumber}" numaralı faturayı silmek istediğinize emin misiniz?`)) return;
    const res = await apiDelete<boolean>(ENDPOINTS.invoicesById(invoice.id));
    if (res.success) triggerRefresh();
    else alert(res.message);
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    window.open(ENDPOINTS.invoicesPdf(invoice.id), "_blank");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Faturalar ({totalCount})</h2>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Fatura no / müşteri ara..." value={filters.search ?? ""} onChange={(e) => updateFilter("search", e.target.value)} style={inputStyle} />
        <select value={filters.status ?? ""} onChange={(e) => updateFilter("status", e.target.value)} style={inputStyle}>
          <option value="">Tüm Durumlar</option>
          <option value="Draft">Taslak</option>
          <option value="Sent">Gönderildi</option>
          <option value="Paid">Ödendi</option>
          <option value="Cancelled">İptal</option>
        </select>
        <input type="date" value={filters.startDate ?? ""} onChange={(e) => updateFilter("startDate", e.target.value)} style={inputStyle} title="Başlangıç tarihi" />
        <input type="date" value={filters.endDate ?? ""} onChange={(e) => updateFilter("endDate", e.target.value)} style={inputStyle} title="Bitiş tarihi" />
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}

      <div style={{ background: "#fff", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={thStyle}>Fatura No</th>
              <th style={thStyle}>Müşteri</th>
              <th style={thStyle}>Ürün</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Tutar</th>
              <th style={{ ...thStyle, textAlign: "right" }}>KDV</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Toplam</th>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>Durum</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>Yükleniyor...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Fatura bulunamadı</td></tr>
            ) : (
              invoices.map((inv) => {
                const st = STATUS_MAP[inv.status] ?? STATUS_MAP.Draft;
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td style={tdStyle}>{inv.customerName}</td>
                    <td style={tdStyle}>{inv.productName}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{inv.saleTotalPrice.toLocaleString("tr-TR")} ₺</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>%{inv.taxRate}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{inv.totalAmount.toLocaleString("tr-TR")} ₺</td>
                    <td style={tdStyle}>{new Date(inv.invoiceDate).toLocaleDateString("tr-TR")}</td>
                    <td style={tdStyle}>
                      <select value={inv.status} onChange={(e) => handleStatusChange(inv, e.target.value)} style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, background: st.bg, color: st.color, fontWeight: 500, border: `1px solid ${st.color}33` }}>
                        <option value="Draft">Taslak</option>
                        <option value="Sent">Gönderildi</option>
                        <option value="Paid">Ödendi</option>
                        <option value="Cancelled">İptal</option>
                      </select>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button onClick={() => setDetailInvoice(inv)} style={{ ...btnSmall, background: "#f1f3f5" }}>Detay</button>{" "}
                      <button onClick={() => handleDownloadPdf(inv)} style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}>PDF</button>{" "}
                      {inv.status === "Draft" && (
                        <button onClick={() => handleDelete(inv)} style={{ ...btnSmall, background: "var(--danger)", color: "#fff" }}>Sil</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
          <button disabled={!filters.page || filters.page <= 1} onClick={() => updateFilter("page", (filters.page ?? 1) - 1)} style={btnSmall}>Önceki</button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Sayfa {filters.page} / {totalPages}</span>
          <button disabled={!filters.page || filters.page >= totalPages} onClick={() => updateFilter("page", (filters.page ?? 1) + 1)} style={btnSmall}>Sonraki</button>
        </div>
      )}

      {detailInvoice && (
        <div style={overlayStyle} onClick={() => setDetailInvoice(null)}>
          <div style={{ ...modalStyle, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Fatura Detayı</h3>
              <button onClick={() => setDetailInvoice(null)} style={btnSmall}>Kapat</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div><strong>Fatura No:</strong> {detailInvoice.invoiceNumber}</div>
              <div><strong>Tarih:</strong> {new Date(detailInvoice.invoiceDate).toLocaleDateString("tr-TR")}</div>
              <div><strong>Müşteri:</strong> {detailInvoice.customerName}</div>
              <div><strong>Tip:</strong> {detailInvoice.customerType === "Company" ? "Şirket" : "Şahıs"}</div>
              {detailInvoice.customerTaxNumber && <div><strong>Vergi No:</strong> {detailInvoice.customerTaxNumber}</div>}
              {detailInvoice.customerTaxOffice && <div><strong>Vergi Dairesi:</strong> {detailInvoice.customerTaxOffice}</div>}
              {detailInvoice.customerNationalId && <div><strong>TC Kimlik:</strong> {detailInvoice.customerNationalId}</div>}
              {detailInvoice.customerAddress && <div><strong>Adres:</strong> {detailInvoice.customerAddress}</div>}
              {detailInvoice.customerPhone && <div><strong>Telefon:</strong> {detailInvoice.customerPhone}</div>}
            </div>

            <div style={{ background: "#f8f9fa", borderRadius: "var(--radius)", padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, fontSize: 14 }}>
                <div><strong>Ürün:</strong> {detailInvoice.productName}</div>
                <div><strong>Miktar:</strong> {detailInvoice.quantity} adet</div>
                <div><strong>Birim Fiyat:</strong> {detailInvoice.unitPrice.toLocaleString("tr-TR")} ₺</div>
                <div><strong>KDV:</strong> %{detailInvoice.taxRate}</div>
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: 18, fontWeight: 700, color: "var(--success)" }}>
              Toplam: {detailInvoice.totalAmount.toLocaleString("tr-TR")} ₺
            </div>

            {detailInvoice.notes && (
              <div style={{ marginTop: 12, padding: 12, background: "#fff9db", borderRadius: "var(--radius)", fontSize: 13 }}>
                <strong>Notlar:</strong> {detailInvoice.notes}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button onClick={() => handleDownloadPdf(detailInvoice)} style={{ ...btnSmall, background: "var(--primary)", color: "#fff", padding: "8px 16px" }}>PDF İndir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" };
const tdStyle: React.CSSProperties = { padding: "10px 16px", fontSize: 14 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, outline: "none", background: "#fff" };
const btnSmall: React.CSSProperties = { padding: "5px 12px", background: "#f1f3f5", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13 };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: "#fff", borderRadius: "var(--radius)", padding: 24, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
