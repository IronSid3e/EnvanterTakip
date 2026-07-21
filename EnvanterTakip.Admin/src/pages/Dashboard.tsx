import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  type ApiResponse,
  type DashboardStats,
} from "../config/api";

const cardStyle = (color: string): React.CSSProperties => ({
  background: "#fff",
  borderRadius: "var(--radius)",
  padding: "20px 24px",
  boxShadow: "var(--shadow)",
  borderLeft: `4px solid ${color}`,
  flex: "1 1 0",
  minWidth: 180,
});

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<DashboardStats>(ENDPOINTS.salesDashboard).then(
      (res: ApiResponse<DashboardStats>) => {
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.message);
        }
        setLoading(false);
      },
    );
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 600 }}>
        Dashboard
      </h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={cardStyle("#0d6efd")}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            Toplam Ürün
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalProducts}</div>
        </div>
        <div style={cardStyle("#198754")}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            Toplam Satış
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalSales}</div>
        </div>
        <div style={cardStyle("#ffc107")}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            Toplam Gelir
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {stats.totalRevenue.toLocaleString("tr-TR")} ₺
          </div>
        </div>
        <div style={cardStyle("#dc3545")}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            Düşük / Tükenen Stok
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {stats.lowStockProducts} / {stats.outOfStockProducts}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px", background: "#fff", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 15 }}>
            Son Satışlar
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={thStyle}>Ürün</th>
                <th style={thStyle}>Satıcı</th>
                <th style={thStyle}>Adet</th>
                <th style={thStyle}>Tutar</th>
                <th style={thStyle}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{sale.productName}</td>
                  <td style={tdStyle}>{sale.sellerName}</td>
                  <td style={tdStyle}>{sale.quantity}</td>
                  <td style={tdStyle}>{sale.totalPrice.toLocaleString("tr-TR")} ₺</td>
                  <td style={tdStyle}>{new Date(sale.saleDate).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
              {stats.recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "var(--text-muted)" }}>
                    Henüz satış yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ flex: "1 1 300px", background: "#fff", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 15 }}>
            En Çok Satan Ürünler
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={thStyle}>Ürün</th>
                <th style={thStyle}>Satılan</th>
                <th style={thStyle}>Gelir</th>
              </tr>
            </thead>
            <tbody>
              {stats.topSellingProducts.map((p) => (
                <tr key={p.productId} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{p.productName}</td>
                  <td style={tdStyle}>{p.totalSold}</td>
                  <td style={tdStyle}>{p.totalRevenue.toLocaleString("tr-TR")} ₺</td>
                </tr>
              ))}
              {stats.topSellingProducts.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: "var(--text-muted)" }}>
                    Veri yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-muted)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
};
