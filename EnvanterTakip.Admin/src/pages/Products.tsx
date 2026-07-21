import { useEffect, useState } from "react";
import {
  ENDPOINTS,
  apiGet,
  apiDelete,
  apiPost,
  apiPut,
  type ApiResponse,
  type PaginatedResponse,
  type Product,
  type ProductFilterParams,
} from "../config/api";

function useProductFilters(initial: ProductFilterParams) {
  const [filters, setFilters] = useState<ProductFilterParams>(initial);
  const updateFilter = (key: keyof ProductFilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };
  return { filters, updateFilter, setFilters };
}

function buildProductParams(filters: ProductFilterParams) {
  const params: Record<string, unknown> = { ...filters };
  if (params.category === "") delete params.category;
  if (params.search === "") delete params.search;
  if (params.inStock === undefined) delete params.inStock;
  return params;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { filters, updateFilter } = useProductFilters({
    page: 1,
    pageSize: 10,
    search: "",
    category: "",
    inStock: undefined,
    sortBy: "name",
    sortDescending: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    apiGet<PaginatedResponse<Product>>(
      ENDPOINTS.products,
      buildProductParams(filters),
    ).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) {
        setProducts(res.data.items);
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
    apiGet<string[]>(ENDPOINTS.productsCategories).then(
      (res: ApiResponse<string[]>) => {
        if (res.success && res.data) setCategories(res.data);
      },
    );
  }, []);

  const handleDelete = async (product: Product) => {
    if (!confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`))
      return;
    const res = await apiDelete<boolean>(ENDPOINTS.productsById(product.id));
    if (res.success) {
      triggerRefresh();
    } else {
      alert(res.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
    triggerRefresh();
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
          Ürünler ({totalCount})
        </h2>
        <button onClick={handleCreate} style={btnPrimary}>
          + Yeni Ürün
        </button>
      </div>

      {/* Filtreler */}
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
        <select
          value={filters.category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          style={inputStyle}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.inStock === undefined ? "" : String(filters.inStock)}
          onChange={(e) => {
            const v = e.target.value;
            updateFilter("inStock", v === "" ? undefined : v === "true");
          }}
          style={inputStyle}
        >
          <option value="">Tüm Stok Durumu</option>
          <option value="true">Stokta Var</option>
          <option value="false">Stok Dışı</option>
        </select>
      </div>

      {error && (
        <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
      )}

      {/* Tablo */}
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
              <th style={thStyle}>Ad</th>
              <th style={thStyle}>Barkod</th>
              <th style={thStyle}>Kategori</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Fiyat</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Stok</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 32 }}>
                  Yükleniyor...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  Ürün bulunamadı
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                    {p.barcode ?? "-"}
                  </td>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {p.price.toLocaleString("tr-TR")} ₺
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      color:
                        p.stock === 0
                          ? "var(--danger)"
                          : p.stock <= 5
                            ? "var(--warning)"
                            : "var(--text)",
                      fontWeight: p.stock <= 5 ? 600 : 400,
                    }}
                  >
                    {p.stock}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}
                    >
                      Düzenle
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(p)}
                      style={{ ...btnSmall, background: "var(--danger)", color: "#fff" }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
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

      {/* Form Modal */}
      {showForm && (
        <div style={overlayStyle} onClick={handleFormClose}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <ProductForm
              product={editProduct}
              categories={categories}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
}: {
  product: Product | null;
  categories: string[];
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name,
      description,
      barcode: barcode || null,
      stock: parseInt(stock, 10) || 0,
      category,
      price: parseFloat(price) || 0,
    };

    let res;
    if (product) {
      res = await apiPut<unknown>(ENDPOINTS.productsById(product.id), body);
    } else {
      res = await apiPost<unknown>(ENDPOINTS.products, body);
    }

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
        {product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
      </h3>

      {error && (
        <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          placeholder="Ürün adı *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Barkod"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Stok *"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min={0}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Kategori *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            list="category-list"
            style={{ ...inputStyle, flex: 1 }}
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input
            type="number"
            placeholder="Fiyat *"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={0}
            step={0.01}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <button type="button" onClick={onClose} style={btnSmall}>
          İptal
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{ ...btnSmall, background: "var(--primary)", color: "#fff" }}
        >
          {saving ? "Kaydediliyor..." : product ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </form>
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
  background: "#f1f3f5",
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
  background: "#fff",
  borderRadius: "var(--radius)",
  padding: 24,
  width: "100%",
  maxWidth: 520,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
