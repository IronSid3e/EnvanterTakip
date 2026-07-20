import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ENDPOINTS, apiGet, apiPost } from "@/config/api";
import { CameraView } from "expo-camera";

export default function AddProductScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await apiGet<string[]>(ENDPOINTS.productsCategories);
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Kategoriler alinamadi:", error);
    }
  };

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    setBarcode(data);
    setShowScanner(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setBarcode("");
    setPrice("");
    setStock("");
    setCategory("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Uyarı", "Ürün adı boş olamaz.");
      return;
    }
    if (!price || parseFloat(price) < 0) {
      Alert.alert("Uyarı", "Geçerli bir fiyat girin.");
      return;
    }
    if (!stock || parseInt(stock) < 0) {
      Alert.alert("Uyarı", "Geçerli bir stok miktarı girin.");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Uyarı", "Kategori boş olamaz.");
      return;
    }

    try {
      setLoading(true);

      const result = await apiPost(ENDPOINTS.products, {
        name: name.trim(),
        description: description.trim(),
        barcode: barcode.trim() || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category.trim(),
      });

      if (!result.success) {
        Alert.alert("Hata", result.message || "Ürün oluşturulamadı");
        return;
      }

      Alert.alert("Başarılı", `"${name.trim()}" başarıyla eklendi.`, [
        { text: "Tamam", onPress: resetForm },
      ]);
    } catch (error) {
      Alert.alert("Hata", "Ürün eklenirken bir hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (showScanner) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "code39", "code128", "upc_a", "upc_e"],
          }}
        />
        <TouchableOpacity
          style={styles.cancelScanButton}
          onPress={() => setShowScanner(false)}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.cancelScanText}>Iptal</Text>
        </TouchableOpacity>
        <View style={styles.scanOverlay}>
          <Text style={styles.scanOverlayText}>Barkodu tarayin</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yeni Ürün Ekle</Text>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Barkod</Text>
            <View style={styles.barcodeRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Barkod girin veya tarayin"
                value={barcode}
                onChangeText={setBarcode}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setShowScanner(true)}
              >
                <Ionicons name="scan" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ürün Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Orn: Dana Pirzola"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ürün açıklaması (isteğe bağlı)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Fiyat (TL) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Stok *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kategori *</Text>
            <TextInput
              style={styles.input}
              placeholder="Orn: Et Urunleri"
              value={category}
              onChangeText={setCategory}
            />
            {categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryChips}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(category === cat ? "" : cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.submitButtonText}>Ürünü Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  form: { flex: 1 },
  formContent: { padding: 20, paddingBottom: 120 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  barcodeRow: { flexDirection: "row", alignItems: "center" },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  categoryChips: { marginTop: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: "#2ecc71", borderColor: "#2ecc71" },
  categoryChipText: { fontSize: 13, color: "#666" },
  categoryChipTextActive: { color: "#fff", fontWeight: "600" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },
  submitButtonText: { color: "white", fontSize: 17, fontWeight: "600" },
  cancelScanButton: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
  },
  cancelScanText: { color: "white", fontSize: 15, fontWeight: "600" },
  scanOverlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanOverlayText: { color: "white", fontSize: 18, fontWeight: "600" },
});
