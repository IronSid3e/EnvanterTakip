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
import { ENDPOINTS, StockEntry, PaginatedResponse, apiGet } from "@/config/api";

export default function EntriesScreen() {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      const result = await apiGet<PaginatedResponse<StockEntry>>(
        `${ENDPOINTS.stockEntries}?pageSize=100`
      );
      if (result.success && result.data) {
        setEntries(result.data.items);
      }
    } catch (error) {
      console.error("Stok girişleri alınamadı:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const renderEntry = ({ item }: { item: StockEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.supplierName}>{item.supplierName}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoChip}>
          <Ionicons name="add-circle-outline" size={14} color="#27ae60" />
          <Text style={[styles.infoText, { color: "#27ae60", fontWeight: "600" }]}>
            +{item.quantity} adet
          </Text>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.entryDate).toLocaleDateString("tr-TR")}
          </Text>
        </View>
        {item.note ? (
          <View style={styles.infoChip}>
            <Ionicons name="chatbubble-outline" size={14} color="#999" />
            <Text style={styles.infoText} numberOfLines={1}>{item.note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stok Girişleri</Text>
        <Text style={styles.headerSubtitle}>{entries.length} giriş kaydı</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={styles.center} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ecc71" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="archive-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Henüz stok girişi bulunmuyor.</Text>
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
  supplierName: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  cardFooter: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#95a5a6",
    fontSize: 15,
  },
});
