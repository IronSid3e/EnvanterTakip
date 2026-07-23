import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";

export default function SettingsMenu() {
  const { mode, colors, setMode } = useTheme();
  const [visible, setVisible] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "light", label: "Açık Mod", icon: "sunny-outline" },
    { value: "dark", label: "Koyu Mod", icon: "moon-outline" },
  ];

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.trigger, { backgroundColor: colors.surfaceHover }]}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.menuTitle, { color: colors.text }]}>Ayarlar</Text>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Tema</Text>
            <View style={styles.themeRow}>
              {themeOptions.map((opt) => {
                const isActive = mode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setMode(opt.value)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surfaceHover,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={isActive ? colors.primaryText : colors.text}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        { color: isActive ? colors.primaryText : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surfaceHover }]}
              onPress={() => setVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Kapat</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: 280,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  themeRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
