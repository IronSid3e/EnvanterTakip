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
import { useTheme } from "@/contexts/ThemeContext";
import SettingsMenu from "@/components/SettingsMenu";

export default function HomeScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.productName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.category ? (
            <Text
              style={[styles.categoryText, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.priceText, { color: colors.success }]}>
          {item.price.toLocaleString("tr-TR")} TL
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          {item.barcode ? (
            <Text style={[styles.barcodeText, { color: colors.textSecondary }]}>
              <Ionicons
                name="barcode-outline"
                size={14}
                color={colors.textSecondary}
              />{" "}
              {item.barcode}
            </Text>
          ) : null}
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor:
                  item.stock === 0
                    ? colors.surfaceHover
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
                    ? colors.textMuted
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Şua Tarım Envanter
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {totalCount} ürün
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={onRefresh}
            style={[
              styles.refreshBtn,
              { backgroundColor: colors.surfaceHover },
            ]}
          >
            <Ionicons name="refresh" size={22} color={colors.text} />
          </TouchableOpacity>
          <SettingsMenu />
        </View>
      </View>

      {/* Arama Çubuğu */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Ürün ara... (isim, barkod, kategori)"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
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
                {
                  backgroundColor: colors.chipBg,
                  borderColor: colors.chipBorder,
                },
                !selectedCategory && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  !selectedCategory && {
                    color: colors.primaryText,
                    fontWeight: "600",
                  },
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
                  {
                    backgroundColor: colors.chipBg,
                    borderColor: colors.chipBorder,
                  },
                  selectedCategory === cat && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    selectedCategory === cat && {
                      color: colors.primaryText,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {cat + " "}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Ürün Listesi */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.center}
        />
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
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="cube-outline"
                size={50}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  filterContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  filterChip: {
    flexShrink: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 36,
    justifyContent: "center",
  },
  filterChipText: { fontSize: 13, lineHeight: 18 },
  listContent: { padding: 15, paddingBottom: 100 },
  card: {
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
  productName: { fontSize: 17, fontWeight: "700" },
  categoryText: {
    fontSize: 12,
    textTransform: "uppercase",
    marginTop: 2,
  },
  priceText: { fontSize: 16, fontWeight: "bold" },
  divider: { height: 1, marginVertical: 10 },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barcodeText: { fontSize: 13, marginBottom: 6 },
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
    fontSize: 15,
  },
});
