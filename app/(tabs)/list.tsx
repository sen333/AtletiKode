"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useFonts, Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope"
import * as SplashScreen from "expo-splash-screen"
import { supabase } from "../lib/supabase"
import QRCode from "react-native-qrcode-svg"
import { Feather } from "@expo/vector-icons"

SplashScreen.preventAutoHideAsync()

const List = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  })

  const navigation = useNavigation()
 const [vouchers, setVouchers] = useState([])
const [unclaimedCount, setUnclaimedCount] = useState(0)
const [claimedCount, setClaimedCount] = useState(0)
const [loading, setLoading] = useState(true)
const [selectedVoucher, setSelectedVoucher] = useState(null)
const [qrModalVisible, setQrModalVisible] = useState(false)
const [qrData, setQrData] = useState("")
const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
  try {
    setLoading(true)

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
      .order("id", { ascending: false })

    if (error) throw error

    setVouchers(data || [])

    // Calculate unclaimed and claimed counts
    const unclaimed = data?.filter(
      (voucher) => voucher.Vouchers.Status === "Unclaimed"
    ).length || 0
    const claimed = data?.filter(
      (voucher) => voucher.Vouchers.Status === "Claimed"
    ).length || 0

    setUnclaimedCount(unclaimed)
    setClaimedCount(claimed)
  } catch (error) {
    console.error("Error fetching vouchers:", error)
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}

  const handleRefresh = () => {
    setRefreshing(true)
    fetchVouchers()
  }

  const handleVoucherPress = async (voucher) => {
    try {
      setSelectedVoucher(voucher)

      // First try to get the QR data from the qr table
      try {
        // Try to get the qr_data field first (if it exists)
        const { data: qrDataWithField, error: qrDataError } = await supabase
          .from("qr")
          .select("qr_data, voucher_code")
          .eq("voucher_code", voucher.id)
          .single()

        if (qrDataError) {
          console.error("Error fetching QR data:", qrDataError)

          // If that fails, try just getting the voucher_code
          const { data: qrCodeOnly, error: qrCodeError } = await supabase
            .from("qr")
            .select("voucher_code")
            .eq("voucher_code", voucher.id)
            .single()

          if (qrCodeError) {
            console.error("Error fetching voucher_code:", qrCodeError)
            // Fallback to using the voucher ID directly
            setQrData(voucher.id)
          } else if (qrCodeOnly) {
            // Use the voucher_code as the QR data
            setQrData(qrCodeOnly.voucher_code)
          } else {
            // Fallback to using the voucher ID directly
            setQrData(voucher.id)
          }
        } else if (qrDataWithField && qrDataWithField.qr_data) {
          // Use the stored qr_data value
          setQrData(qrDataWithField.qr_data)
        } else if (qrDataWithField) {
          // Fallback to using the voucher_code
          setQrData(qrDataWithField.voucher_code)
        } else {
          // Fallback to using the voucher ID directly
          setQrData(voucher.id)
        }
      } catch (qrTableError) {
        console.warn("QR table not accessible, using voucher ID:", qrTableError)
        // Fallback to using the voucher ID directly
        setQrData(voucher.id)
      }

      setQrModalVisible(true)
    } catch (error) {
      console.error("Error handling voucher press:", error)
    }
  }

  const handleEditVoucher = (voucher) => {
    // Navigate to the editVoucher screen with the voucher ID
    navigation.navigate("editVoucher", { id: voucher.id })
  }

  const closeQrModal = () => {
    setQrModalVisible(false)
    setSelectedVoucher(null)
    setQrData("")
  }

  const renderVoucherItem = ({ item }) => {
    const customer = item.Customers
    const voucher = item.Vouchers

    if (!customer || !voucher) return null

    return (
      <TouchableOpacity style={styles.voucherItem} onPress={() => handleVoucherPress(item)}>
        <View style={styles.voucherHeader}>
          <Text style={styles.voucherName}>
            {customer.FirstName} {customer.LastName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  voucher.Status === "Claimed" ? "#4CAF50" : voucher.Status === "Unclaimed" ? "#FF9800" : "#F44336",
              },
            ]}
          >
            <Text style={styles.statusText}>{voucher.Status}</Text>
          </View>
        </View>

        <View style={styles.voucherDetails}>
          <Text style={styles.voucherEmail}>{customer.Email}</Text>
          <Text style={styles.voucherDiscount}>Discount: {voucher.Discount}%</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditVoucher(item)}>
            <Feather name="edit" size={18} color="#63120E" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  if (!fontsLoaded) return null

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

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Voucher List</Text>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.statsContainer}>
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>{unclaimedCount}</Text>
    <Text style={styles.statLabel}>Unclaimed Vouchers</Text>
  </View>
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>{claimedCount}</Text>
    <Text style={styles.statLabel}>Claimed Vouchers</Text>
  </View>
</View>

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
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No vouchers found</Text>
            </View>
          }
        />
      )}

      {/* Add Voucher Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("addVoucher")}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* QR Code Modal */}
      <Modal visible={qrModalVisible} transparent={true} animationType="fade" onRequestClose={closeQrModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voucher QR Code</Text>

            {selectedVoucher && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalName}>
                  {selectedVoucher.Customers.FirstName} {selectedVoucher.Customers.LastName}
                </Text>
                <Text style={styles.modalEmail}>{selectedVoucher.Customers.Email}</Text>
                <Text style={styles.modalPhone}>{selectedVoucher.Customers.ContactNumber}</Text>
                <Text style={styles.modalDiscount}>Discount: {selectedVoucher.Vouchers.Discount}%</Text>
                <Text style={styles.modalEvent}>Event: {selectedVoucher.EventID}</Text>
                <View
                  style={[
                    styles.modalStatusBadge,
                    {
                      backgroundColor:
                        selectedVoucher.Vouchers.Status === "Claimed"
                          ? "#4CAF50"
                          : selectedVoucher.Vouchers.Status === "Unclaimed"
                            ? "#FF9800"
                            : "#F44336",
                    },
                  ]}
                >
                  <Text style={styles.modalStatusText}>{selectedVoucher.Vouchers.Status}</Text>
                </View>
              </View>
            )}

            <View style={styles.qrContainer}>
              {qrData ? (
                <QRCode value={qrData} size={250} />
              ) : (
                <Text style={styles.noQrText}>QR code not available</Text>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeQrModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    height: height * 0.16,
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    paddingRight: 50,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: width * 0.12,
    height: width * 0.12,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
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
    marginVertical: 0,
  },
  listContent: {
    padding: 12,
  },
  voucherItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
    fontSize: width * 0.036,
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
  voucherDetails: {
    marginTop: 2,
    marginBottom: 8,
  },
  voucherEmail: {
    fontSize: width * 0.032,
    fontFamily: "Manrope_400Regular",
    color: "#555",
    marginBottom: 2,
  },
  voucherDiscount: {
    fontSize: width * 0.032,
    fontFamily: "Manrope_700Bold",
    color: "#63120E",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  editButtonText: {
    marginLeft: 2,
    color: "#63120E",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.025,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: width * 0.04,
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
  modalDetails: {
    alignItems: "center",
    marginBottom: 20,
  },
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
  qrContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: width * 0.8,
    height: width * 0.8,
  },
  noQrText: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#555",
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
  statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: 0,
  marginBottom: 0,
  width: '90%',
  marginLeft: '5%',
},
statBox: {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  padding: 10,
  width: '45%',
},
statNumber: {
  fontSize: width * 0.08,
  fontWeight: 'bold',
  color: '#13390B',
  fontFamily: 'Manrope_700Bold',
  marginBottom: 5,
},
statLabel: {
  fontSize: width * 0.03,
  color: '#555',
  textAlign: 'center',
  fontFamily: 'Manrope_400Regular',
},
})

export default List
