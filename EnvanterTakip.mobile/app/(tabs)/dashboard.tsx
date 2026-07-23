import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ENDPOINTS, DashboardStats, apiGet } from "@/config/api";

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const result = await apiGet<DashboardStats>(ENDPOINTS.salesDashboard);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Dashboard verileri alınamadı:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2ecc71" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Genel bakış</Text>
      </View>

      {stats && (
        <>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: "#3498db" }]}>
              <Ionicons name="cube-outline" size={24} color="#3498db" />
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Toplam Ürün</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#2ecc71" }]}>
              <Ionicons name="cart-outline" size={24} color="#2ecc71" />
              <Text style={styles.statValue}>{stats.totalSales}</Text>
              <Text style={styles.statLabel}>Toplam Satış</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#6f42c1" }]}>
              <Ionicons name="time-outline" size={24} color="#6f42c1" />
              <Text style={styles.statValue}>{stats.todaySalesCount}</Text>
              <Text style={styles.statLabel}>Bugünkü Satış</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#20c997" }]}>
              <Ionicons name="layers-outline" size={24} color="#20c997" />
              <Text style={styles.statValue}>{stats.totalStockCount}</Text>
              <Text style={styles.statLabel}>Toplam Stok</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#e74c3c" }]}>
              <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
              <Text style={styles.statValue}>{stats.lowStockProducts}</Text>
              <Text style={styles.statLabel}>Düşük Stok</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#95a5a6" }]}>
              <Ionicons name="close-circle-outline" size={24} color="#95a5a6" />
              <Text style={styles.statValue}>{stats.outOfStockProducts}</Text>
              <Text style={styles.statLabel}>Tükenen</Text>
            </View>
          </View>

          {stats.topSellingProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>En Çok Satan Ürünler</Text>
              {stats.topSellingProducts.map((item, index) => (
                <View key={item.productId} style={styles.topProductRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topProductName}>{item.productName}</Text>
                    <Text style={styles.topProductDetail}>
                      {item.totalSold} adet satıldı
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {stats.recentSales.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Son Satışlar</Text>
              {stats.recentSales.map((sale) => (
                <View key={sale.id} style={styles.saleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.saleProductName}>{sale.productName}</Text>
                    <Text style={styles.saleDetail}>
                      {sale.sellerName} · {sale.quantity} adet
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.saleDate}>
                      {new Date(sale.saleDate).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 15 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  headerSubtitle: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 8,
  },
  statLabel: { fontSize: 13, color: "#95a5a6", marginTop: 2 },
  section: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  topProductRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  topProductName: { fontSize: 15, fontWeight: "600", color: "#333" },
  topProductDetail: { fontSize: 12, color: "#95a5a6", marginTop: 2 },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  saleProductName: { fontSize: 15, fontWeight: "600", color: "#333" },
  saleDetail: { fontSize: 12, color: "#95a5a6", marginTop: 2 },
  saleDate: { fontSize: 12, color: "#95a5a6" },
});
