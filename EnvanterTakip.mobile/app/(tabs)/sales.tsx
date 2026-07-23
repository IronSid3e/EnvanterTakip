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
import { useTheme } from "@/contexts/ThemeContext";
import SettingsMenu from "@/components/SettingsMenu";

export default function SalesScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.productName}</Text>
          <Text style={[styles.sellerName, { color: colors.textMuted }]}>{item.sellerName}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.cardFooter}>
        <View style={styles.infoChip}>
          <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.quantity} adet</Text>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {new Date(item.saleDate).toLocaleDateString("tr-TR")}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Satış Geçmişi</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{sales.length} satış kaydı</Text>
        </View>
        <SettingsMenu />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.center} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSale}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={50} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz satış kaydı bulunmuyor.</Text>
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
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
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
  productName: { fontSize: 16, fontWeight: "700" },
  sellerName: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  cardFooter: { flexDirection: "row", gap: 16 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13 },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
  },
});
