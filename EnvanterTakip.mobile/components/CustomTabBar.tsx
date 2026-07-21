import React from "react";
import { View, StyleSheet, Platform, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_CONFIG: {
  [key: string]: {
    icon: keyof typeof Ionicons.glyphMap;
    iconFocused: keyof typeof Ionicons.glyphMap;
    label: string;
  };
} = {
  dashboard: { icon: "grid-outline", iconFocused: "grid", label: "Anasayfa" },
  index: { icon: "list-outline", iconFocused: "list", label: "Ürünler" },
  "add-product": {
    icon: "add-circle-outline",
    iconFocused: "add-circle",
    label: "Ekle",
  },
  sales: { icon: "receipt-outline", iconFocused: "receipt", label: "Satışlar" },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const tabOrder = ["dashboard", "index", "scanner", "add-product", "sales"];
  const tabs = tabOrder
    .map((name) => state.routes.find((r) => r.name === name)!)
    .filter(Boolean);

  const scannerRoute = tabs.find((r) => r.name === "scanner");
  const leftTabs = tabs.filter((r) => r.name !== "scanner").slice(0, 2);
  const rightTabs = tabs.filter((r) => r.name !== "scanner").slice(2);

  const renderTab = (route: (typeof tabs)[0]) => {
    const config = TAB_CONFIG[route.name];
    if (!config) return null;
    const isFocused = state.index === state.routes.indexOf(route);

    return (
      <Pressable
        key={route.name}
        style={styles.tab}
        onPress={() => navigation.navigate(route.name)}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pressed ? 0.85 : 1 }] },
            ]}
          >
            <Ionicons
              name={isFocused ? config.iconFocused : config.icon}
              size={24}
              color={isFocused ? "#2ecc71" : "#95a5a6"}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? "#2ecc71" : "#95a5a6" },
              ]}
            >
              {config.label}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        {leftTabs.map(renderTab)}
        <View style={styles.centerPlaceholder} />
        {rightTabs.map(renderTab)}
      </View>

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
                <Ionicons name="scan-outline" size={28} color="#fff" />
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
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  centerPlaceholder: {
    flex: 1,
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
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  absoluteCenterContainer: {
    position: "absolute",
    top: -28,
    left: "50%",
    marginLeft: -32,
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
