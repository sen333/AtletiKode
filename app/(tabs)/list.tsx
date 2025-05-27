"use client";

import { Manrope_400Regular, Manrope_700Bold, useFonts } from "@expo-google-fonts/manrope";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../lib/supabase";

const voucherTemplate = require("../../assets/images/New.png");
SplashScreen.preventAutoHideAsync();

const List = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const navigation = useNavigation();
  const [vouchers, setVouchers] = useState<ReleasedVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<ReleasedVoucher | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ReleasedVoucher")
        .select(`
          id,
          VoucherID,
          CustomerID,
          EventID,
          Vouchers:VoucherID (id, Discount, Status),
          Customers:CustomerID (id, FirstName, LastName, Email, ContactNumber)
        `)
        .order("id", { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const handleVoucherPress = async (voucher: ReleasedVoucher) => {
    setSelectedVoucher(voucher);
    try {
      const { data: qrDataEntry } = await supabase
        .from("qr")
        .select("qr_data")
        .eq("voucher_code", voucher.id)
        .single();

      setQrData(qrDataEntry?.qr_data ?? voucher.id.toString());
    } catch (error) {
      console.warn("QR fetch error:", error);
      setQrData(voucher.id.toString());
    }
    setQrModalVisible(true);
  };

  const closeQrModal = () => {
    setQrModalVisible(false);
    setSelectedVoucher(null);
    setQrData("");
  };

  const renderVoucherItem = ({ item }: { item: ReleasedVoucher }) => {
    const customer = item.Customers;
    const voucher = item.Vouchers;
    if (!customer || !voucher) return null;

    return (
      <TouchableOpacity style={styles.voucherItem} onPress={() => handleVoucherPress(item)}>
        <View style={styles.voucherHeader}>
          <Text style={styles.voucherName}>{customer.FirstName} {customer.LastName}</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: voucher.Status === "Claimed" ? "#4CAF50" : voucher.Status === "Unclaimed" ? "#FF9800" : "#F44336",
          }]}>
            <Text style={styles.statusText}>{voucher.Status}</Text>
          </View>
        </View>
        <View style={styles.voucherDetails}>
          <Text style={styles.voucherEmail}>{customer.Email}</Text>
          <Text style={styles.voucherDiscount}>Discount: {voucher.Discount}%</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("editVoucher", { id: item.id })}>
            <Feather name="edit" size={18} color="#63120E" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#63120E", "#4A0707"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/images/logo2.png")} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AtletiKode</Text>
            <Text style={styles.headerSubtitle}>UP Mindanao Atletika's Voucher Management System</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionTitleContainer}><Text style={styles.sectionTitle}>Voucher List</Text></View>
      <View style={styles.horizontalLine} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#63120E" />
          <Text style={styles.loadingText}>Loading vouchers...</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          renderItem={renderVoucherItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("addVoucher")}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={qrModalVisible} transparent={true} animationType="fade" onRequestClose={closeQrModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voucher QR Code</Text>
            {selectedVoucher && (
              <>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalName}>{selectedVoucher.Customers.FirstName} {selectedVoucher.Customers.LastName}</Text>
                  <Text style={styles.modalEmail}>{selectedVoucher.Customers.Email}</Text>
                  <Text style={styles.modalPhone}>{selectedVoucher.Customers.ContactNumber}</Text>
                  <Text style={styles.modalDiscount}>Discount: {selectedVoucher.Vouchers.Discount}% OFF</Text>
                  <Text style={styles.modalEvent}>Event: {selectedVoucher.EventID ?? "N/A"}</Text>
                  <View style={[styles.modalStatusBadge, {
                    backgroundColor: selectedVoucher.Vouchers.Status === "Claimed" ? "#4CAF50" : "#FF9800"
                  }]}>
                    <Text style={styles.modalStatusText}>{selectedVoucher.Vouchers.Status}</Text>
                  </View>
                </View>

                <View style={styles.voucherWrapper}>
                  <ImageBackground source={voucherTemplate} style={styles.voucherImage} resizeMode="contain">
                    <View style={styles.qrCodeBox}>
                      <QRCode value={qrData} size={58} />
                    </View>
                    <Text style={styles.percentageText}>{selectedVoucher.Vouchers.Discount}% OFF</Text>
                    <Text style={styles.voucherCodeTop}>{String(selectedVoucher.EventID ?? "")}</Text>
                  </ImageBackground>
                </View>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeQrModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    height: height * 0.16,
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 50,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  logo: { width: width * 0.12, height: width * 0.12, marginRight: 10 },
  headerTextContainer: { flexDirection: "column" },
  headerTitle: {
    fontSize: width * 0.05,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.42,
  },
  headerSubtitle: {
    fontSize: width * 0.03,
    color: "#fff",
    fontFamily: "Manrope_400Regular",
    letterSpacing: -0.42,
  },
  sectionTitleContainer: {
    padding: 14,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#F8F8F8",
    marginTop: -30,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#13390B",
    marginLeft: 4,
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.6,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
  },
  listContent: { padding: 16 },
  voucherItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  voucherName: {
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
    color: "#13390B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: width * 0.03,
    fontFamily: "Manrope_700Bold",
  },
  voucherDetails: { marginTop: 4, marginBottom: 12 },
  voucherEmail: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#555",
  },
  voucherDiscount: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_700Bold",
    color: "#63120E",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 12,
  },
  editButton: { flexDirection: "row", alignItems: "center", padding: 6 },
  editButtonText: {
    marginLeft: 4,
    color: "#63120E",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.03,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#63120E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxHeight: height * 0.85,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontFamily: "Manrope_700Bold",
    color: "#13390B",
    marginBottom: 16,
  },
  modalDetails: { alignItems: "center", marginBottom: 20 },
  modalName: {
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
    color: "#333",
    marginBottom: 4,
  },
  modalDiscount: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#63120E",
  },
  modalEmail: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#666",
    marginBottom: 4,
  },
  modalPhone: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  modalEvent: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#666",
    marginBottom: 8,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  modalStatusText: {
    color: "#fff",
    fontSize: width * 0.03,
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  voucherWrapper: {
    width: 295,
    height: 110,
    overflow: "hidden",
    marginBottom: 16,
  },
  voucherImage: {
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeBox: {
    position: "absolute",
    top: 21,
    left: 221,
    width: 60,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    position: "absolute",
    bottom: 10,
    right: 18,
    color: "#f8a50c",
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
  voucherCodeTop: {
    position: "absolute",
    top: 8,
    right: 30,
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
});

export default List;
