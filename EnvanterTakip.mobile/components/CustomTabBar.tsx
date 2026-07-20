import React from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const tabOrder = ["index", "scanner", "add-product"];
  const tabs = tabOrder.map(
    (name) => state.routes.find((r) => r.name === name)!,
  );

  // Tarayıcı butonunu barın dışında (üst katmanda) render edebilmek için buluyoruz
  const scannerRoute = tabs.find((r) => r.name === "scanner");

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* 1. Kısım: Arka Plandaki Kusursuz Yuvarlak (Hap) Bar */}
      <View style={styles.bar}>
        {tabs.map((route, i) => {
          const isCenter = route.name === "scanner";
          const isFocused = state.index === state.routes.indexOf(route);
          const color = isFocused ? "#2ecc71" : "#95a5a6";

          const onPress = () => {
            navigation.navigate(route.name);
          };

          // Merkez için sadece boşluk ayırıyoruz. Böylece barın sınırları ihlal edilmiyor.
          if (isCenter) {
            return <View key={route.name} style={styles.centerPlaceholder} />;
          }

          // Sağ ve Sol Sekmeler
          return (
            <Pressable key={route.name} style={styles.tab} onPress={onPress}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.iconContainer,
                    { transform: [{ scale: pressed ? 0.85 : 1 }] },
                  ]}
                >
                  <Ionicons
                    name={
                      i === 0
                        ? isFocused
                          ? "list"
                          : "list-outline"
                        : isFocused
                          ? "add-circle"
                          : "add-circle-outline"
                    }
                    size={26}
                    color={color}
                  />
                  {isFocused && (
                    <View
                      style={[styles.activeDot, { backgroundColor: color }]}
                    />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* 2. Kısım: Taşan Merkez Butonu (Bağımsız Konumlandırıldı) */}
      {scannerRoute && (
        <View style={styles.absoluteCenterContainer} pointerEvents="box-none">
          <Pressable onPress={() => navigation.navigate("scanner")}>
            {({ pressed }) => (
              <View
                style={[
                  styles.centerButton,
                  styles.centerShadow,
                  { transform: [{ scale: pressed ? 0.9 : 1 }] },
                ]}
              >
                <Ionicons name="scan-outline" size={30} color="#fff" />
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 20,
    right: 20,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    height: 70,
    borderRadius: 35, // Tam yuvarlak hap tasarımı (Artık taşan çocuk eleman yok)
    paddingHorizontal: 10,
    // Gölgeler sorunsuz bir şekilde oluşturulacak
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  centerPlaceholder: {
    flex: 1, // Barın ortasındaki boşluğu eşit dağıtmak için
  },
  tab: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    position: "absolute",
    bottom: -10,
  },
  absoluteCenterContainer: {
    position: "absolute",
    top: -25, // Barın üzerine doğru çıkarır
    left: "50%",
    marginLeft: -32, // Buton genişliğinin (64) tam yarısı kadar sola çekip merkeze oturtur
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2ecc71",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#f8f9fa",
  },
  centerShadow: {
    shadowColor: "#2ecc71",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
