import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  type PaginatedResponse,
  type Sale,
  type SaleFilterParams,
} from "../config/api";

function buildSaleParams(filters: SaleFilterParams) {
  const params: Record<string, unknown> = { ...filters };
  if (params.search === "") delete params.search;
  if (params.sellerName === "") delete params.sellerName;
  if (params.startDate === "") delete params.startDate;
  if (params.endDate === "") delete params.endDate;
  return params;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<SaleFilterParams>({
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "saleDate",
    sortDescending: true,
    sellerName: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let cancelled = false;

    apiGet<PaginatedResponse<Sale>>(ENDPOINTS.sales, buildSaleParams(filters)).then(
      (res) => {
        if (cancelled) return;
        setLoading(false);
        if (res.success && res.data) {
          setSales(res.data.items);
          setTotalCount(res.data.totalCount);
          setTotalPages(res.data.totalPages);
          setError("");
        } else {
          setError(res.message);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const updateFilter = (key: keyof SaleFilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 600 }}>
        Satış Geçmişi ({totalCount})
      </h2>

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
          placeholder="Ürün ara..."
          value={filters.search ?? ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Satıcı adı..."
          value={filters.sellerName ?? ""}
          onChange={(e) => updateFilter("sellerName", e.target.value)}
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
          background: "#fff",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={thStyle}>Ürün</th>
              <th style={thStyle}>Satıcı</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Adet</th>
              <th style={thStyle}>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Yükleniyor...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  Satış bulunamadı
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{s.productName}</td>
                  <td style={tdStyle}>{s.sellerName}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{s.quantity}</td>
                  <td style={tdStyle}>
                    {new Date(s.saleDate).toLocaleDateString("tr-TR")}
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
  background: "#fff",
};

const btnSmall: React.CSSProperties = {
  padding: "5px 12px",
  background: "#f1f3f5",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: 13,
};
