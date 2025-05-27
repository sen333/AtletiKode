"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useFonts, Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope"
import * as SplashScreen from "expo-splash-screen"
import { supabase } from "../lib/supabase"

SplashScreen.preventAutoHideAsync()

const ReviewVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  })

  const navigation = useNavigation()
  const route = useRoute()
  const { voucherData } = route.params
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log("Starting voucher creation process...")

      // Step 1: Check if customer exists, if not create a new one
      const { data: existingCustomers, error: customerCheckError } = await supabase
        .from("Customers")
        .select("id")
        .eq("Email", voucherData.email)
        .limit(1)

      if (customerCheckError) {
        console.error("Customer check error:", customerCheckError)
        throw customerCheckError
      }

      let customerId

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id
        console.log("Found existing customer:", customerId)
      } else {
        // Create new customer
        const { data: newCustomer, error: createCustomerError } = await supabase
          .from("Customers")
          .insert([
            {
              FirstName: voucherData.firstName,
              LastName: voucherData.lastName,
              Email: voucherData.email,
              ContactNumber: voucherData.phoneNumber,
            },
          ])
          .select()

        if (createCustomerError) {
          console.error("Customer creation error:", createCustomerError)
          throw createCustomerError
        }
        customerId = newCustomer[0].id
        console.log("Created new customer:", customerId)
      }

      // Step 2: Create a new voucher
      console.log("Creating voucher...")
      const { data: newVoucher, error: voucherError } = await supabase
        .from("Vouchers")
        .insert([
          {
            Discount: Number.parseFloat(voucherData.discount),
            Status: "Unclaimed",
          },
        ])
        .select()

      if (voucherError) {
        console.error("Voucher creation error:", voucherError)
        throw voucherError
      }

      const voucherId = newVoucher[0].id
      console.log("Created voucher with ID:", voucherId)

      // Step 3: Get the event ID from the voucher code
      console.log("Looking up event:", voucherData.voucherCode)
      const { data: eventData, error: eventError } = await supabase
        .from("Events")
        .select("id")
        .eq("id", voucherData.voucherCode)
        .limit(1)

      if (eventError) {
        console.error("Event lookup error:", eventError)
        throw eventError
      }

      const eventId = eventData && eventData.length > 0 ? eventData[0].id : voucherData.voucherCode
      console.log("Using event ID:", eventId)

      // Step 4: Create a released voucher
      console.log("Creating released voucher...")
      const { data: releasedVoucher, error: releasedVoucherError } = await supabase
        .from("ReleasedVoucher")
        .insert([
          {
            VoucherID: voucherId,
            CustomerID: customerId,
            EventID: eventId,
          },
        ])
        .select()

      if (releasedVoucherError) {
        console.error("Released voucher creation error:", releasedVoucherError)
        throw releasedVoucherError
      }

      const releasedVoucherId = releasedVoucher[0].id
      console.log("Created released voucher:", releasedVoucherId)

      // Step 5: Generate and store QR code (like it was working before)
      const qrValue = JSON.stringify({
        customerID: customerId,
        voucherID: voucherId,
        releasedID: releasedVoucherId,
        firstName: voucherData.firstName,
        lastName: voucherData.lastName,
        email: voucherData.email,
        phoneNumber: voucherData.phoneNumber,
        discount: voucherData.discount,
        voucherCode: voucherData.voucherCode,
      })

      // Step 6: Store the QR code in the qr table (restore original working logic)
      console.log("Creating QR code entry for released voucher:", releasedVoucherId)
      const { data: qrData, error: qrError } = await supabase
        .from("qr")
        .insert([
          {
            voucher_code: releasedVoucherId,
            qr_data: qrValue,
          },
        ])
        .select()

      if (qrError) {
        console.error("QR insert error with qr_data:", qrError)
        console.log("Trying without qr_data column...")

        const { error: fallbackQrError } = await supabase.from("qr").insert([
          {
            voucher_code: releasedVoucherId,
          },
        ])

        if (fallbackQrError) {
          console.error("Fallback QR insert error:", fallbackQrError)
          console.warn("QR code creation failed, but voucher was created successfully")
        } else {
          console.log("QR code created successfully without qr_data")
        }
      } else {
        console.log("QR code created successfully with qr_data:", qrData)
      }

      console.log("Voucher and QR creation completed. Navigating to generate screen...")

      // Navigate to generateVoucher screen with the generated data
      navigation.navigate("generateVoucher", {
        generatedData: {
          customerID: customerId,
          voucherID: voucherId,
          releasedID: releasedVoucherId,
          firstName: voucherData.firstName,
          lastName: voucherData.lastName,
          email: voucherData.email,
          phoneNumber: voucherData.phoneNumber,
          discount: voucherData.discount,
          voucherCode: voucherData.voucherCode,
          qrValue: qrValue, // Pass the QR value that was stored
        },
      })
    } catch (error) {
      console.error("Error submitting voucher:", error)
      setIsSubmitting(false)
      Alert.alert("Error", `Failed to create voucher: ${error.message}`)
    }
  }

  const handleEditDetails = () => {
    // Navigate back to the addVoucher screen with the current data
    navigation.navigate("addVoucher", { editData: voucherData })
  }

  if (!fontsLoaded) return null

  return (
    <View style={styles.container}>
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
        <Text style={styles.sectionTitle}>Review Voucher Details</Text>
      </View>

      <View style={styles.horizontalLine} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* NO QR PREVIEW - Just show the details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Recipient Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>
              {voucherData.firstName} {voucherData.lastName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{voucherData.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{voucherData.phoneNumber}</Text>
          </View>

          <Text style={[styles.detailsTitle, styles.voucherTitle]}>Voucher Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Discount:</Text>
            <Text style={styles.detailValue}>{voucherData.discount}%</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event Code:</Text>
            <Text style={styles.detailValue}>{voucherData.voucherCode}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.editButton, isSubmitting && styles.disabledButton]}
            onPress={handleEditDetails}
            disabled={isSubmitting}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>{isSubmitting ? "Creating..." : "Confirm & Create"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  detailsContainer: {
    width: "100%",
    marginTop: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
    color: "#13390B",
    marginBottom: 15,
  },
  voucherTitle: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    width: "30%",
    fontSize: width * 0.035,
    fontFamily: "Manrope_700Bold",
    color: "#555",
  },
  detailValue: {
    width: "70%",
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
  },
  editButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#63120E",
    width: "48%",
  },
  editButtonText: {
    color: "#63120E",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  confirmButton: {
    backgroundColor: "#63120E",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%",
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  disabledButton: {
    opacity: 0.7,
  },
})

export default ReviewVoucher
