import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  ENDPOINTS,
  Product,
  ApiResponse,
  PaginatedResponse,
  apiGet,
} from "@/config/api";

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    try {
      let url = `${ENDPOINTS.products}?pageSize=100`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedCategory)
        url += `&category=${encodeURIComponent(selectedCategory)}`;

      const result = await apiGet<PaginatedResponse<Product>>(url);

      if (result.success && result.data) {
        setProducts(result.data.items);
        setTotalCount(result.data.totalCount);
      } else {
        Alert.alert("Hata", result.message || "Veriler çekilemedi");
      }
    } catch (error) {
      console.error("Hata:", error);
      Alert.alert("Hata", "API'ye bağlanılamadı. Bağlantıyı kontrol edin.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await apiGet<string[]>(ENDPOINTS.productsCategories);
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Kategoriler alınamadı:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchCategories();
    }, [search, selectedCategory]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.category ? (
            <Text style={styles.categoryText}>{item.category}</Text>
          ) : null}
        </View>
        <Text style={styles.priceText}>
          {item.price.toLocaleString("tr-TR")} TL
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          {item.barcode ? (
            <Text style={styles.barcodeText}>
              <Ionicons name="barcode-outline" size={14} /> {item.barcode}
            </Text>
          ) : null}
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor:
                  item.stock === 0
                    ? "#f0f0f0"
                    : item.stock < 5
                      ? "#ffcccc"
                      : "#ccffcc",
              },
            ]}
          >
            <Text
              style={{
                color:
                  item.stock === 0
                    ? "#999"
                    : item.stock < 5
                      ? "#cc0000"
                      : "#006600",
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {item.stock === 0
                ? "Tükendi"
                : item.stock < 5
                  ? `Düşük Stok: ${item.stock}`
                  : `Stok: ${item.stock}`}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#3498db" }]}
            onPress={() =>
              Alert.alert(item.name, item.description || "Açıklama bulunmuyor.")
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Şua Tarım Envanter</Text>
          <Text style={styles.headerSubtitle}>{totalCount} ürün</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün ara... (isim, barkod, kategori)"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Kategori Filtresi */}
      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedCategory && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedCategory && styles.filterChipTextActive,
                ]}
              >
                Tümü {}
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  selectedCategory === cat && styles.filterChipActive,
                ]}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat} {}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Ürün Listesi */}
      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={styles.center} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2ecc71"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="cube-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {search || selectedCategory
                  ? "Aramanızla eşleşen ürün bulunamadı."
                  : "Henüz ürün eklenmemiş."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  headerSubtitle: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  filterContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#2ecc71",
    borderColor: "#2ecc71",
  },
  filterChipText: { fontSize: 13, color: "#666" },
  filterChipTextActive: { color: "#fff", fontWeight: "600" },
  listContent: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: { fontSize: 17, fontWeight: "700", color: "#333" },
  categoryText: {
    fontSize: 12,
    color: "#95a5a6",
    textTransform: "uppercase",
    marginTop: 2,
  },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#27ae60" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barcodeText: { fontSize: 13, color: "#7f8c8d", marginBottom: 6 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  actionButtons: { flexDirection: "row" },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#95a5a6",
    fontSize: 15,
  },
});
