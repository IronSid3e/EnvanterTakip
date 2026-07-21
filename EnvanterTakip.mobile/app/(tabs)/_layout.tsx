import React from "react";
import { Tabs } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="scanner" />
      <Tabs.Screen name="add-product" />
      <Tabs.Screen name="sales" />
    </Tabs>
  );
}
