import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  type PaginatedResponse,
  type Customer,
  type CustomerFilterParams,
} from "../config/api";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<CustomerFilterParams>({
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "name",
    sortDescending: false,
  });
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, unknown> = { ...filters };
    if (params.search === "") delete params.search;
    if (params.type === "") delete params.type;

    apiGet<PaginatedResponse<Customer>>(ENDPOINTS.customers, params).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setCustomers(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
        setError("");
      } else {
        setError(res.message);
      }
    });
    return () => { cancelled = true; };
  }, [filters, refreshKey]);

  const updateFilter = (key: keyof CustomerFilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`"${customer.name}" müşterisini silmek istediğinize emin misiniz?`)) return;
    const res = await apiDelete<boolean>(ENDPOINTS.customersById(customer.id));
    if (res.success) triggerRefresh();
    else alert(res.message);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Müşteriler ({totalCount})</h2>
        <button onClick={() => { setEditCustomer(null); setShowForm(true); }} style={btnPrimary}>+ Yeni Müşteri</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Müşteri ara..." value={filters.search ?? ""} onChange={(e) => updateFilter("search", e.target.value)} style={inputStyle} />
        <select value={filters.type ?? ""} onChange={(e) => updateFilter("type", e.target.value)} style={inputStyle}>
          <option value="">Tüm Tipler</option>
          <option value="Company">Şirket</option>
          <option value="Individual">Şahıs</option>
        </select>
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}

      <div style={{ background: "#fff", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={thStyle}>Ad</th>
              <th style={thStyle}>Tip</th>
              <th style={thStyle}>Vergi No / TC</th>
              <th style={thStyle}>Vergi Dairesi</th>
              <th style={thStyle}>Telefon</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>Yükleniyor...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Müşteri bulunamadı</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{c.name}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 500, background: c.type === "Company" ? "#e0f2fe" : "#f0fdf4", color: c.type === "Company" ? "#0369a1" : "#166534" }}>
                      {c.type === "Company" ? "Şirket" : "Şahıs"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace" }}>{c.type === "Company" ? (c.taxNumber ?? "-") : (c.nationalId ?? "-")}</td>
                  <td style={tdStyle}>{c.type === "Company" ? (c.taxOffice ?? "-") : "-"}</td>
                  <td style={tdStyle}>{c.phone ?? "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button onClick={() => { setEditCustomer(c); setShowForm(true); }} style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}>Düzenle</button>{" "}
                    <button onClick={() => handleDelete(c)} style={{ ...btnSmall, background: "var(--danger)", color: "#fff" }}>Sil</button>
                  </td>
                </tr>
              ))
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

      {showForm && (
        <div style={overlayStyle} onClick={() => { setShowForm(false); setEditCustomer(null); }}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <CustomerForm customer={editCustomer} onClose={() => { setShowForm(false); setEditCustomer(null); triggerRefresh(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerForm({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const [type, setType] = useState(customer?.type ?? "Individual");
  const [name, setName] = useState(customer?.name ?? "");
  const [taxNumber, setTaxNumber] = useState(customer?.taxNumber ?? "");
  const [taxOffice, setTaxOffice] = useState(customer?.taxOffice ?? "");
  const [nationalId, setNationalId] = useState(customer?.nationalId ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = { type, name, taxNumber: taxNumber || null, taxOffice: taxOffice || null, nationalId: nationalId || null, address: address || null, phone: phone || null };

    const res = customer
      ? await apiPut<unknown>(ENDPOINTS.customersById(customer.id), body)
      : await apiPost<unknown>(ENDPOINTS.customers, body);

    if (res.success) onClose();
    else { setError(res.message); setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>{customer ? "Müşteri Düzenle" : "Yeni Müşteri"}</h3>
      {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", flex: 1, background: type === "Individual" ? "#f0fdf4" : "#fff" }}>
            <input type="radio" name="type" value="Individual" checked={type === "Individual"} onChange={() => setType("Individual")} /> Şahıs
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", flex: 1, background: type === "Company" ? "#e0f2fe" : "#fff" }}>
            <input type="radio" name="type" value="Company" checked={type === "Company"} onChange={() => setType("Company")} /> Şirket
          </label>
        </div>

        <input type="text" placeholder={type === "Company" ? "Şirket adı *" : "Ad Soyad *"} value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

        {type === "Company" ? (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="text" placeholder="Vergi Numarası" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input type="text" placeholder="Vergi Dairesi" value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>
          </>
        ) : (
          <input type="text" placeholder="TC Kimlik Numarası (11 haneli)" value={nationalId} onChange={(e) => setNationalId(e.target.value)} maxLength={11} style={inputStyle} />
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <input type="text" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input type="text" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <button type="button" onClick={onClose} style={btnSmall}>İptal</button>
        <button type="submit" disabled={saving} style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}>{saving ? "Kaydediliyor..." : customer ? "Güncelle" : "Ekle"}</button>
      </div>
    </form>
  );
}

const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" };
const tdStyle: React.CSSProperties = { padding: "10px 16px", fontSize: 14 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, outline: "none", background: "#fff" };
const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 500 };
const btnSmall: React.CSSProperties = { padding: "5px 12px", background: "#f1f3f5", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13 };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: "#fff", borderRadius: "var(--radius)", padding: 24, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
