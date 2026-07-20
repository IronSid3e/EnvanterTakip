import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import {
  ENDPOINTS,
  Product,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/config/api";

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  // Sale form
  const [sellerName, setSellerName] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Update form
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateStock, setUpdateStock] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const fetchProductByBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      const result = await apiGet<Product>(ENDPOINTS.productsByBarcode(barcode));

      if (!result.success) {
        Alert.alert("Ürün Bulunamadı", result.message || "Bu barkoda ait ürün sistemde kayıtlı değil.");
        return null;
      }
      return result.data;
    } catch (error) {
      Alert.alert("Hata", "Ürün bilgileri alınırken bir hata oluştu");
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sellProduct = async () => {
    if (!product || !sellerName.trim()) {
      Alert.alert("Uyarı", "Lütfen satıcı adını girin");
      return;
    }

    const quantity = parseInt(saleQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Uyarı", "Geçerli bir miktar girin");
      return;
    }

    if (quantity > product.stock) {
      Alert.alert("Uyarı", `Stokta yeterli ürün yok. Mevcut: ${product.stock}`);
      return;
    }

    try {
      setLoading(true);

      const result = await apiPost(ENDPOINTS.sales, {
        productId: product.id,
        sellerName: sellerName.trim(),
        quantity: quantity,
        saleDate: saleDate,
      });

      if (!result.success) {
        Alert.alert("Hata", result.message || "Satış kaydı oluşturulamadı");
        return;
      }

      Alert.alert("Başarılı", "Ürün satışı başarıyla kaydedildi");

      setSellerName("");
      setSaleQuantity("1");
      setSaleDate(new Date().toISOString().split("T")[0]);
      setSaleModalVisible(false);
      resetScanner();
    } catch (error) {
      Alert.alert("Hata", "Satış kaydedilirken bir hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    if (!product) return;

    const updatedData = {
      name: updateName.trim() || product.name,
      description: updateDescription.trim() || product.description,
      barcode: product.barcode,
      price: parseFloat(updatePrice) || product.price,
      stock: parseInt(updateStock) || product.stock,
      category: updateCategory.trim() || product.category,
    };

    try {
      setLoading(true);

      const result = await apiPut(ENDPOINTS.productsById(product.id), updatedData);

      if (!result.success) {
        Alert.alert("Hata", result.message || "Ürün güncellenemedi");
        return;
      }

      Alert.alert("Başarılı", "Ürün başarıyla güncellendi");

      setUpdateModalVisible(false);
      resetScanner();
    } catch (error) {
      Alert.alert("Hata", "Ürün güncellenirken bir hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = () => {
    if (!product) return;

    Alert.alert(
      "Ürünü Sil",
      `"${product.name}" ürününü silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const result = await apiDelete(ENDPOINTS.productsById(product.id));

              if (!result.success) {
                Alert.alert("Hata", result.message || "Ürün silinemedi");
                return;
              }

              Alert.alert("Başarılı", "Ürün başarıyla silindi");
              setDetailsModalVisible(false);
              setProduct(null);
              setScanned(false);
              setScanning(true);
            } catch (error) {
              Alert.alert("Hata", "Ürün silinirken bir hata oluştu");
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setScanning(false);

    const productData = await fetchProductByBarcode(data);

    if (productData) {
      setProduct(productData);
      setDetailsModalVisible(true);
      setUpdateName(productData.name);
      setUpdateDescription(productData.description || "");
      setUpdatePrice(productData.price.toString());
      setUpdateStock(productData.stock.toString());
      setUpdateCategory(productData.category || "");
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(true);
    setProduct(null);
    setDetailsModalVisible(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.text}>Kamera izni bekleniyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color="#999" />
        <Text style={styles.text}>Kamera erişim izni verilmedi</Text>
        <Text style={[styles.text, { fontSize: 13, marginTop: 4 }]}>
          Ayarlardan kamera iznini açın
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "code39", "code128", "upc_a", "upc_e"],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scanText}>Barkodu tarayın</Text>
          </View>
        </>
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.text}>Ürün aranıyor...</Text>
        </View>
      )}

      {/* Ürün Detayları Modal */}
      <Modal animationType="slide" transparent visible={detailsModalVisible} onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürün Detayları</Text>
              <TouchableOpacity onPress={resetScanner}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {product && (
              <ScrollView style={styles.detailsScroll}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barkod</Text>
                  <Text style={styles.detailValue}>{product.barcode || "—"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ürün Adı</Text>
                  <Text style={styles.detailValue}>{product.name}</Text>
                </View>
                {product.description ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Açıklama</Text>
                    <Text style={styles.detailValue}>{product.description}</Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fiyat</Text>
                  <Text style={[styles.detailValue, { color: "#27ae60", fontSize: 18, fontWeight: "bold" }]}>
                    {product.price.toLocaleString("tr-TR")} TL
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stok</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      product.stock === 0
                        ? { color: "#999" }
                        : product.stock < 10
                          ? styles.lowStock
                          : styles.normalStock,
                    ]}
                  >
                    {product.stock === 0 ? "Tükendi" : `${product.stock} adet`}
                  </Text>
                </View>
                {product.category ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kategori</Text>
                    <Text style={styles.detailValue}>{product.category}</Text>
                  </View>
                ) : null}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.sellButton]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      setSaleModalVisible(true);
                    }}
                  >
                    <Ionicons name="cart" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Ürünü Sat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.updateButton]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      setUpdateModalVisible(true);
                    }}
                  >
                    <Ionicons name="create" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Güncelle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={deleteProduct}>
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
              <Ionicons name="scan" size={20} color="white" />
              <Text style={styles.scanAgainText}>Yeni Ürün Tara</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Satış Modal */}
      <Modal animationType="slide" transparent visible={saleModalVisible} onRequestClose={() => setSaleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürün Satışı</Text>
              <TouchableOpacity onPress={() => setSaleModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              {product && (
                <>
                  <View style={styles.saleProductInfo}>
                    <Text style={styles.saleProductName}>{product.name}</Text>
                    <Text style={styles.saleProductPrice}>
                      {product.price.toLocaleString("tr-TR")} TL
                    </Text>
                    <Text style={styles.saleProductStock}>
                      Mevcut Stok: {product.stock} adet
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Satıcı Adı *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Satıcı adını girin"
                      value={sellerName}
                      onChangeText={setSellerName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Miktar *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Satılacak miktar"
                      value={saleQuantity}
                      onChangeText={setSaleQuantity}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Satış Tarihi *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-AA-GG"
                      value={saleDate}
                      onChangeText={setSaleDate}
                    />
                  </View>

                  <View style={styles.totalPriceContainer}>
                    <Text style={styles.totalPriceLabel}>Toplam Tutar</Text>
                    <Text style={styles.totalPriceValue}>
                      {(product.price * parseInt(saleQuantity || "0")).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      TL
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={sellProduct}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.submitButtonText}>Satışı Onayla</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Güncelleme Modal */}
      <Modal animationType="slide" transparent visible={updateModalVisible} onRequestClose={() => setUpdateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürünü Güncelle</Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ürün Adı *</Text>
                <TextInput style={styles.input} placeholder="Ürün adı" value={updateName} onChangeText={setUpdateName} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Açıklama</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ürün açıklaması"
                  value={updateDescription}
                  onChangeText={setUpdateDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fiyat (TL) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Fiyat"
                  value={updatePrice}
                  onChangeText={setUpdatePrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stok Miktarı *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Stok"
                  value={updateStock}
                  onChangeText={setUpdateStock}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kategori</Text>
                <TextInput style={styles.input} placeholder="Kategori" value={updateCategory} onChangeText={setUpdateCategory} />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={updateProduct} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Kaydet</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  text: { fontSize: 16, marginTop: 12, color: "#666" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  scanArea: { width: 250, height: 250, position: "relative" },
  corner: { position: "absolute", width: 40, height: 40, borderColor: "#2ecc71" },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanText: { color: "white", fontSize: 18, marginTop: 20, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  detailsScroll: { padding: 20 },
  detailRow: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  detailLabel: { fontSize: 13, color: "#999", marginBottom: 4 },
  detailValue: { fontSize: 16, color: "#333", fontWeight: "500" },
  lowStock: { color: "#FF3B30", fontWeight: "bold" },
  normalStock: { color: "#34C759" },
  actionButtons: { marginTop: 20, gap: 10 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 10, gap: 8 },
  sellButton: { backgroundColor: "#2ecc71" },
  updateButton: { backgroundColor: "#3498db" },
  deleteButton: { backgroundColor: "#e74c3c" },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2ecc71",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  scanAgainText: { color: "white", fontSize: 16, fontWeight: "600" },
  formScroll: { padding: 20 },
  saleProductInfo: { backgroundColor: "#f8f9fa", padding: 16, borderRadius: 10, marginBottom: 20 },
  saleProductName: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 6 },
  saleProductPrice: { fontSize: 24, fontWeight: "bold", color: "#27ae60", marginBottom: 4 },
  saleProductStock: { fontSize: 14, color: "#666" },
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
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0faf0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d4edda",
  },
  totalPriceLabel: { fontSize: 16, fontWeight: "600", color: "#666" },
  totalPriceValue: { fontSize: 22, fontWeight: "bold", color: "#27ae60" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
  },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
