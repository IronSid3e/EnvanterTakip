import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ENDPOINTS, Sale, PaginatedResponse, apiGet } from "@/config/api";

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = async () => {
    try {
      const result = await apiGet<PaginatedResponse<Sale>>(
        `${ENDPOINTS.sales}?pageSize=100`
      );
      if (result.success && result.data) {
        setSales(result.data.items);
      }
    } catch (error) {
      console.error("Satışlar alınamadı:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  const renderSale = ({ item }: { item: Sale }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.sellerName}>{item.sellerName}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.totalPrice}>
            {item.totalPrice.toLocaleString("tr-TR")} TL
          </Text>
          <Text style={styles.unitPrice}>
            {item.unitPrice.toLocaleString("tr-TR")} TL / adet
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoChip}>
          <Ionicons name="layers-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{item.quantity} adet</Text>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.saleDate).toLocaleDateString("tr-TR")}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Satış Geçmişi</Text>
        <Text style={styles.headerSubtitle}>{sales.length} satış kaydı</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={styles.center} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSale}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ecc71" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Henüz satış kaydı bulunmuyor.</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  headerSubtitle: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
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
  productName: { fontSize: 16, fontWeight: "700", color: "#333" },
  sellerName: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#27ae60" },
  unitPrice: { fontSize: 12, color: "#95a5a6", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  cardFooter: { flexDirection: "row", gap: 16 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#95a5a6",
    fontSize: 15,
  },
});
