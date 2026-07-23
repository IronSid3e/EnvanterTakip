import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  apiPost,
  type ApiResponse,
  type PaginatedResponse,
  type StockEntry,
  type StockEntryFilterParams,
  type Product,
} from "../config/api";

function buildStockEntryParams(filters: StockEntryFilterParams) {
  const params: Record<string, unknown> = { ...filters };
  if (params.supplierName === "") delete params.supplierName;
  if (params.startDate === "") delete params.startDate;
  if (params.endDate === "") delete params.endDate;
  if (params.productId === undefined) delete params.productId;
  return params;
}

export default function StockEntries() {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState<StockEntryFilterParams>({
    page: 1,
    pageSize: 10,
    supplierName: "",
    startDate: "",
    endDate: "",
  });

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    apiGet<PaginatedResponse<StockEntry>>(
      ENDPOINTS.stockEntries,
      buildStockEntryParams(filters),
    ).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setEntries(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
        setError("");
      } else {
        setError(res.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filters, refreshKey]);

  useEffect(() => {
    apiGet<PaginatedResponse<Product>>(ENDPOINTS.products, {
      pageSize: 1000,
    }).then((res: ApiResponse<PaginatedResponse<Product>>) => {
      if (res.success && res.data) setProducts(res.data.items);
    });
  }, []);

  const updateFilter = (key: keyof StockEntryFilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>
          Stok Girişleri ({totalCount})
        </h2>
        <StockEntryForm
          products={products}
          onClose={triggerRefresh}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Tedarikçi ara..."
          value={filters.supplierName ?? ""}
          onChange={(e) => updateFilter("supplierName", e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) => updateFilter("startDate", e.target.value)}
          style={inputStyle}
          title="Başlangıç tarihi"
        />
        <input
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) => updateFilter("endDate", e.target.value)}
          style={inputStyle}
          title="Bitiş tarihi"
        />
      </div>

      {error && (
        <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
      )}

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--table-header)" }}>
              <th style={thStyle}>Ürün</th>
              <th style={thStyle}>Tedarikçi</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Adet</th>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>Not</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Yükleniyor...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  Stok girişi bulunamadı
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{e.productName}</td>
                  <td style={tdStyle}>{e.supplierName}</td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "var(--success)", fontWeight: 600 }}>
                    +{e.quantity}
                  </td>
                  <td style={tdStyle}>
                    {new Date(e.entryDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                    {e.note ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            disabled={!filters.page || filters.page <= 1}
            onClick={() => updateFilter("page", (filters.page ?? 1) - 1)}
            style={btnSmall}
          >
            Önceki
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Sayfa {filters.page} / {totalPages}
          </span>
          <button
            disabled={!filters.page || filters.page >= totalPages}
            onClick={() => updateFilter("page", (filters.page ?? 1) + 1)}
            style={btnSmall}
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

function StockEntryForm({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      productId: parseInt(productId, 10),
      supplierName,
      quantity: parseInt(quantity, 10) || 1,
      entryDate: new Date().toISOString(),
      note: note || null,
    };

    const res = await apiPost<unknown>(ENDPOINTS.stockEntries, body);
    if (res.success) {
      setOpen(false);
      setProductId("");
      setSupplierName("");
      setQuantity("1");
      setNote("");
      onClose();
    } else {
      setError(res.message);
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={btnPrimary}>
        + Stok Girişi
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={btnPrimary}>
        + Stok Girişi
      </button>
      <div style={overlayStyle} onClick={() => setOpen(false)}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
              Yeni Stok Girişi
            </h3>

            {error && (
              <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Ürün seçin...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Tedarikçi adı *"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Adet *"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min={1}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Not (isteğe bağlı)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => setOpen(false)} style={btnSmall}>
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-muted)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: 14,
  outline: "none",
  background: "var(--surface)",
  color: "var(--text)",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius)",
  fontWeight: 500,
};

const btnSmall: React.CSSProperties = {
  padding: "5px 12px",
  background: "var(--surface-hover)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: 13,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius)",
  padding: 24,
  width: "100%",
  maxWidth: 520,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
