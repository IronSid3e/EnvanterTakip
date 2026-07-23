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
import { useTheme } from "@/contexts/ThemeContext";
import SettingsMenu from "@/components/SettingsMenu";

export default function DashboardScreen() {
  const { colors } = useTheme();
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
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textMuted, fontSize: 15 }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Genel bakış</Text>
        </View>
        <SettingsMenu />
      </View>

      {stats && (
        <>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: "#3498db" }]}>
              <Ionicons name="cube-outline" size={24} color="#3498db" />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalProducts}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Toplam Ürün</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: colors.primary }]}>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalSales}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Toplam Satış</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: "#6f42c1" }]}>
              <Ionicons name="time-outline" size={24} color="#6f42c1" />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.todaySalesCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bugünkü Satış</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: "#20c997" }]}>
              <Ionicons name="layers-outline" size={24} color="#20c997" />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalStockCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Toplam Stok</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: colors.danger }]}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.lowStockProducts}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Düşük Stok</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderLeftColor: colors.textMuted }]}>
              <Ionicons name="close-circle-outline" size={24} color={colors.textMuted} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.outOfStockProducts}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tükenen</Text>
            </View>
          </View>

          {stats.topSellingProducts.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>En Çok Satan Ürünler</Text>
              {stats.topSellingProducts.map((item, index) => (
                <View key={item.productId} style={[styles.topProductRow, { borderBottomColor: colors.divider }]}>
                  <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.topProductName, { color: colors.text }]}>{item.productName}</Text>
                    <Text style={[styles.topProductDetail, { color: colors.textMuted }]}>
                      {item.totalSold} adet satıldı
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {stats.recentSales.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Satışlar</Text>
              {stats.recentSales.map((sale) => (
                <View key={sale.id} style={[styles.saleRow, { borderBottomColor: colors.divider }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.saleProductName, { color: colors.text }]}>{sale.productName}</Text>
                    <Text style={[styles.saleDetail, { color: colors.textMuted }]}>
                      {sale.sellerName} · {sale.quantity} adet
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.saleDate, { color: colors.textMuted }]}>
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
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  statCard: {
    width: "47%",
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
    marginTop: 8,
  },
  statLabel: { fontSize: 13, marginTop: 2 },
  section: {
    marginHorizontal: 12,
    marginTop: 16,
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
    marginBottom: 12,
  },
  topProductRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  topProductName: { fontSize: 15, fontWeight: "600" },
  topProductDetail: { fontSize: 12, marginTop: 2 },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  saleProductName: { fontSize: 15, fontWeight: "600" },
  saleDetail: { fontSize: 12, marginTop: 2 },
  saleDate: { fontSize: 12 },
});
