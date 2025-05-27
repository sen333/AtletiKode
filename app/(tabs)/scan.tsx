"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  AppState,
} from "react-native"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope"
import * as SplashScreen from "expo-splash-screen"
import { supabase } from "../lib/supabase"

const { width, height } = Dimensions.get("window")
const scanBoxSize = width * 0.7

const ScanScreen = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  })

  const [facing, setFacing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [processing, setProcessing] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [voucherDetails, setVoucherDetails] = useState(null)
  const qrLock = useRef(false)
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  const processVoucherClaim = async (qrData: string) => {
    try {
      setProcessing(true)
      console.log("🔍 Processing QR data:", qrData)

      let voucherId = null
      let releasedVoucherId = null

      // Try to parse as JSON first
      try {
        const parsedData = JSON.parse(qrData)
        console.log("📋 Parsed QR data:", parsedData)

        if (parsedData.releasedID) {
          releasedVoucherId = parsedData.releasedID
        } else if (parsedData.voucherID) {
          voucherId = parsedData.voucherID
        } else if (parsedData.id) {
          releasedVoucherId = parsedData.id
        }
      } catch (e) {
        // If not JSON, treat as direct ID
        console.log("📝 Using QR data as direct ID:", qrData)
        releasedVoucherId = qrData
      }

      // Method 1: Try using releasedVoucherId
      if (releasedVoucherId) {
        console.log("🔍 Looking up by ReleasedVoucher ID:", releasedVoucherId)

        const { data: releasedVoucher, error: releasedError } = await supabase
          .from("ReleasedVoucher")
          .select(`
            id,
            VoucherID,
            CustomerID,
            EventID,
            Vouchers:VoucherID (id, Discount, Status),
            Customers:CustomerID (id, FirstName, LastName, Email)
          `)
          .eq("id", releasedVoucherId)
          .single()

        if (!releasedError && releasedVoucher) {
          console.log("✅ Found voucher via ReleasedVoucher:", releasedVoucher)

          if (releasedVoucher.Vouchers.Status === "Claimed") {
            Alert.alert("Already Claimed", "This voucher has already been claimed.")
            return
          }

          // Update voucher status
          const { error: updateError } = await supabase
            .from("Vouchers")
            .update({ Status: "Claimed" })
            .eq("id", releasedVoucher.VoucherID)

          if (updateError) {
            console.error("❌ Error updating voucher:", updateError)
            Alert.alert("Error", "Failed to claim voucher. Please try again.")
            return
          }

          console.log("✅ Voucher claimed successfully!")

          setVoucherDetails({
            name: `${releasedVoucher.Customers.FirstName} ${releasedVoucher.Customers.LastName}`,
            email: releasedVoucher.Customers.Email,
            discount: releasedVoucher.Vouchers.Discount,
            eventId: releasedVoucher.EventID,
          })

          setSuccessModal(true)
          return
        }
      }

      // Method 2: Try using voucherId directly
      if (voucherId) {
        console.log("🔍 Looking up by Voucher ID:", voucherId)

        const { data: voucher, error: voucherError } = await supabase
          .from("Vouchers")
          .select("*")
          .eq("id", voucherId)
          .single()

        if (!voucherError && voucher) {
          console.log("✅ Found voucher directly:", voucher)

          if (voucher.Status === "Claimed") {
            Alert.alert("Already Claimed", "This voucher has already been claimed.")
            return
          }

          // Update voucher status
          const { error: updateError } = await supabase
            .from("Vouchers")
            .update({ Status: "Claimed" })
            .eq("id", voucherId)

          if (updateError) {
            console.error("❌ Error updating voucher:", updateError)
            Alert.alert("Error", "Failed to claim voucher. Please try again.")
            return
          }

          console.log("✅ Voucher claimed successfully!")

          setVoucherDetails({
            name: "Voucher Holder",
            email: "N/A",
            discount: voucher.Discount,
            eventId: "N/A",
          })

          setSuccessModal(true)
          return
        }
      }

      // Method 3: Try looking up in QR table
      console.log("🔍 Looking up in QR table...")
      const { data: qrRecord, error: qrError } = await supabase
        .from("qr")
        .select("voucher_code")
        .eq("qr_data", qrData)
        .single()

      if (!qrError && qrRecord) {
        console.log("✅ Found QR record:", qrRecord)
        // Recursively process with the voucher_code
        await processVoucherClaim(qrRecord.voucher_code)
        return
      }

      console.log("❌ No voucher found for QR data")
      Alert.alert("Invalid QR Code", "This QR code is not associated with any voucher.")
    } catch (error) {
      console.error("❌ Error processing voucher:", error)
      Alert.alert("Error", "An error occurred while processing the voucher. Please try again.")
    } finally {
      setProcessing(false)
      qrLock.current = false
    }
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    console.log("📱 QR Code detected:", data)

    if (qrLock.current || processing) {
      console.log("🔒 QR processing locked, ignoring scan")
      return
    }

    qrLock.current = true
    processVoucherClaim(data)
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const closeSuccessModal = () => {
    setSuccessModal(false)
    setVoucherDetails(null)
    qrLock.current = false
  }

  if (!fontsLoaded) return null
  if (!permission) return <View />
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#63120E", "#4A0707"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/images/logo2.png")} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AtletiKode</Text>
            <Text style={styles.headerSubtitle}>UP Mindanao Atletika's Voucher Management System</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Scan Voucher QR Code</Text>
      </View>
      <View style={styles.horizontalLine} />

      <Text style={styles.subtitle}>Once a valid voucher is scanned, it will be treated as a claimed voucher.</Text>

      {/* Camera */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Processing Overlay */}
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processing voucher...</Text>
            </View>
          )}

          {/* Scan Box Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.topOverlay} />
            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanBox} />
              <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay} />

            <Text style={styles.scanText}>Align QR code within the frame</Text>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* Success Modal */}
      <Modal visible={successModal} transparent={true} animationType="fade" onRequestClose={closeSuccessModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voucher Claimed Successfully!</Text>

            {voucherDetails && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>
                  <Text style={styles.modalLabel}>Name: </Text>
                  {voucherDetails.name}
                </Text>
                <Text style={styles.modalDetailText}>
                  <Text style={styles.modalLabel}>Email: </Text>
                  {voucherDetails.email}
                </Text>
                <Text style={styles.modalDetailText}>
                  <Text style={styles.modalLabel}>Discount: </Text>
                  {voucherDetails.discount}%
                </Text>
                <Text style={styles.modalDetailText}>
                  <Text style={styles.modalLabel}>Event: </Text>
                  {voucherDetails.eventId}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={closeSuccessModal}>
              <Text style={styles.modalButtonText}>Continue Scanning</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  permissionText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
  },
  permissionButton: {
    backgroundColor: "#63120E",
    padding: 10,
    margin: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
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
    marginLeft: 20,
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
  },
  headerSubtitle: {
    fontSize: width * 0.03,
    color: "#fff",
    fontFamily: "Manrope_400Regular",
  },
  sectionTitleContainer: {
    padding: 14,
    backgroundColor: "#F8F8F8",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.6,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: width * 0.026,
    color: "#555",
    fontFamily: "Manrope_400Regular",
    marginBottom: 6,
    alignSelf: "center",
    marginRight: 34,
    justifyContent: "center",
  },
  cameraWrapper: {
    height: height * 0.7,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sideOverlay: {
    width: (width - scanBoxSize) / 2,
    height: scanBoxSize,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scanBox: {
    width: scanBoxSize,
    height: scanBoxSize,
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 4,
  },
  scanText: {
    position: "absolute",
    bottom: 114,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
  },
  cameraControls: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  flipButton: {
    backgroundColor: "#63120E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    bottom: 46,
  },
  flipText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
    fontFamily: "Manrope_700Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontFamily: "Manrope_700Bold",
    color: "#13390B",
    marginBottom: 16,
    textAlign: "center",
  },
  modalDetails: {
    width: "100%",
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#333",
    marginBottom: 8,
  },
  modalLabel: {
    fontFamily: "Manrope_700Bold",
    color: "#13390B",
  },
  modalButton: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
})

export default ScanScreen
