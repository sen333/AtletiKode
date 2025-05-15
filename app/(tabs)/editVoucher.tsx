
import { useEffect, useLayoutEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useLocalSearchParams, router } from "expo-router"
import { useFonts, Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope"
import * as SplashScreen from "expo-splash-screen"
import { supabase } from "../lib/supabase"

SplashScreen.preventAutoHideAsync()

const EditVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  })

  const params = useLocalSearchParams()
  const voucherId = params.id as string
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [releasedVoucherId, setReleasedVoucherId] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [voucherExists, setVoucherExists] = useState(false)
  const [voucherData, setVoucherData] = useState<any>(null)

  // Add state for delete confirmation UI
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    discount: "",
  })

  // Add debug info
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo((prev) => [...prev, info])
  }

  // Function to fetch all vouchers and find the matching one
  const fetchVoucherData = async () => {
    if (!voucherId) {
      setDataLoading(false)
      addDebugInfo("No voucher ID provided")
      return
    }

    try {
      setDataLoading(true)
      addDebugInfo(`Fetching voucher data for ID: ${voucherId}`)

      // First try to get the voucher directly
      const { data: directVoucher, error: directError } = await supabase
        .from("Vouchers")
        .select("*")
        .eq("id", voucherId)
        .single()

      if (!directError && directVoucher) {
        addDebugInfo(`Found voucher directly: ${JSON.stringify(directVoucher)}`)

        // Now get the released voucher that references this voucher
        const { data: releasedData, error: releasedError } = await supabase
          .from("ReleasedVoucher")
          .select(`
            id,
            CustomerID,
            VoucherID,
            EventID
          `)
          .eq("VoucherID", voucherId)
          .single()

        if (!releasedError && releasedData) {
          addDebugInfo(`Found released voucher: ${JSON.stringify(releasedData)}`)
          setReleasedVoucherId(releasedData.id)

          if (releasedData.CustomerID) {
            setCustomerId(releasedData.CustomerID)

            // Get customer data
            const { data: customerData, error: customerError } = await supabase
              .from("Customers")
              .select("*")
              .eq("id", releasedData.CustomerID)
              .single()

            if (!customerError && customerData) {
              addDebugInfo(`Found customer: ${JSON.stringify(customerData)}`)

              // Set form data
              setFormData({
                firstName: customerData.FirstName || "",
                lastName: customerData.LastName || "",
                email: customerData.Email || "",
                phoneNumber: customerData.ContactNumber || "",
                discount: directVoucher.Discount?.toString() || "",
              })

              // Store the complete data
              setVoucherData({
                voucher: directVoucher,
                releasedVoucher: releasedData,
                customer: customerData,
              })

              setVoucherExists(true)
              setDataLoading(false)
              return
            } else {
              addDebugInfo(`Error fetching customer: ${customerError?.message || "No customer found"}`)
            }
          }
        } else {
          addDebugInfo(`Error fetching released voucher: ${releasedError?.message || "No released voucher found"}`)
        }

        // Even if we couldn't get related data, we still have the voucher
        setVoucherData({
          voucher: directVoucher,
        })
        setVoucherExists(true)
        setFormData((prev) => ({
          ...prev,
          discount: directVoucher.Discount?.toString() || "",
        }))
        setDataLoading(false)
        return
      }

      // If direct approach failed, try to find the voucher in ReleasedVoucher
      addDebugInfo("Direct voucher lookup failed, trying through ReleasedVoucher")

      // Try to find the voucher as a ReleasedVoucher ID
      const { data: asReleasedId, error: releasedIdError } = await supabase
        .from("ReleasedVoucher")
        .select(`
          id,
          CustomerID,
          VoucherID,
          EventID
        `)
        .eq("id", voucherId)
        .single()

      if (!releasedIdError && asReleasedId) {
        addDebugInfo(`Found as ReleasedVoucher ID: ${JSON.stringify(asReleasedId)}`)
        setReleasedVoucherId(asReleasedId.id)

        // Get the actual voucher
        const { data: voucherFromReleased, error: voucherError } = await supabase
          .from("Vouchers")
          .select("*")
          .eq("id", asReleasedId.VoucherID)
          .single()

        if (!voucherError && voucherFromReleased) {
          addDebugInfo(`Found voucher from released: ${JSON.stringify(voucherFromReleased)}`)

          if (asReleasedId.CustomerID) {
            setCustomerId(asReleasedId.CustomerID)

            // Get customer data
            const { data: customerData, error: customerError } = await supabase
              .from("Customers")
              .select("*")
              .eq("id", asReleasedId.CustomerID)
              .single()

            if (!customerError && customerData) {
              addDebugInfo(`Found customer: ${JSON.stringify(customerData)}`)

              // Set form data
              setFormData({
                firstName: customerData.FirstName || "",
                lastName: customerData.LastName || "",
                email: customerData.Email || "",
                phoneNumber: customerData.ContactNumber || "",
                discount: voucherFromReleased.Discount?.toString() || "",
              })

              // Store the complete data
              setVoucherData({
                voucher: voucherFromReleased,
                releasedVoucher: asReleasedId,
                customer: customerData,
              })

              setVoucherExists(true)
              setDataLoading(false)
              return
            }
          }

          // Even if we couldn't get customer data
          setVoucherData({
            voucher: voucherFromReleased,
            releasedVoucher: asReleasedId,
          })
          setVoucherExists(true)
          setFormData((prev) => ({
            ...prev,
            discount: voucherFromReleased.Discount?.toString() || "",
          }))
          setDataLoading(false)
          return
        }
      }

      // If all approaches failed, try one last approach - get all vouchers and search
      addDebugInfo("All direct approaches failed, trying to search all vouchers")

      const { data: allVouchers, error: allError } = await supabase.from("Vouchers").select("*")

      if (!allError && allVouchers) {
        // Try to find a match by string comparison
        const matchingVoucher = allVouchers.find((v) => v.id && v.id.toString() === voucherId.toString())

        if (matchingVoucher) {
          addDebugInfo(`Found matching voucher in all vouchers: ${JSON.stringify(matchingVoucher)}`)

          setVoucherData({
            voucher: matchingVoucher,
          })
          setVoucherExists(true)
          setFormData((prev) => ({
            ...prev,
            discount: matchingVoucher.Discount?.toString() || "",
          }))
          setDataLoading(false)
          return
        }
      }

      // If we get here, we couldn't find the voucher
      addDebugInfo("No voucher found with any matching strategy")
      Alert.alert("Error", "Voucher not found. Please check the ID.")
      setVoucherExists(false)
    } catch (error) {
      addDebugInfo(`Error in fetchVoucherData: ${(error as Error).message}`)
      Alert.alert("Error", "Failed to load voucher data")
    } finally {
      setDataLoading(false)
    }
  }

  // Load voucher data on component mount
  useEffect(() => {
    if (voucherId) {
      fetchVoucherData()
    }
  }, [voucherId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Function to directly update discount in Vouchers table
  const updateVoucherDiscount = async (discount: number) => {
    try {
      addDebugInfo(`Directly updating voucher discount to: ${discount}`)

      // Get the actual Voucher ID from the data
      const actualVoucherId = voucherData?.voucher?.id || voucherData?.releasedVoucher?.VoucherID || voucherId

      addDebugInfo(`Using Voucher ID for update: ${actualVoucherId}`)

      const { error } = await supabase
        .from("Vouchers")
        .update({
          Discount: discount,
        })
        .eq("id", actualVoucherId)

      if (error) {
        addDebugInfo(`Error updating discount: ${error.message}`)
        throw new Error(`Failed to update discount: ${error.message}`)
      }

      addDebugInfo("Discount update query executed successfully")
      return true
    } catch (error) {
      addDebugInfo(`Error in updateVoucherDiscount: ${(error as Error).message}`)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (!voucherId) {
      Alert.alert("Error", "Voucher ID is missing")
      return
    }

    if (!voucherExists) {
      Alert.alert("Error", "Voucher not found. Cannot update.")
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      addDebugInfo("Starting update process...")

      // Update voucher discount first
      if (formData.discount) {
        try {
          const discountValue = Number.parseFloat(formData.discount)
          if (isNaN(discountValue)) {
            throw new Error("Discount must be a valid number")
          }

          await updateVoucherDiscount(discountValue)
          addDebugInfo("Discount updated successfully")
        } catch (error) {
          addDebugInfo(`Error updating discount: ${(error as Error).message}`)
          Alert.alert("Error", "Failed to update discount: " + (error as Error).message)
          setLoading(false)
          return
        }
      }

      // Update customer data if we have a customer ID
      if (customerId) {
        addDebugInfo(`Updating customer with ID: ${customerId}`)

        const customerData = {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Email: formData.email,
          ContactNumber: formData.phoneNumber,
        }

        const { error: customerError } = await supabase.from("Customers").update(customerData).eq("id", customerId)

        if (customerError) {
          addDebugInfo(`Error updating customer: ${customerError.message}`)
          Alert.alert("Error", "Failed to update customer details: " + customerError.message)
          setLoading(false)
          return
        }

        addDebugInfo("Customer data updated successfully")
      } else {
        addDebugInfo("No customer ID found, cannot update customer data")
        Alert.alert("Error", "Customer information not found")
        setLoading(false)
        return
      }

      addDebugInfo("All updates completed successfully")
      setLoading(false)

      // Show success alert and then navigate
      // Show a brief success message
      Alert.alert("Success", "Voucher details updated successfully")

      // Automatically navigate to list page after a short delay
      setTimeout(() => {
        router.push("/list")
      }, 1500) // 1.5 second delay to allow the user to see the success message
    } catch (error) {
      addDebugInfo(`Error updating voucher: ${(error as Error).message}`)
      Alert.alert("Error", "Failed to update voucher details: " + (error as Error).message)
      setLoading(false)
    }
  }

  // Show delete confirmation UI
  const handleDelete = () => {
    addDebugInfo("Delete button pressed")
    setShowDeleteConfirm(true)
    setDeleteError(null)
    setDeleteStatus(null)
  }

  // Cancel delete
  const cancelDelete = () => {
    addDebugInfo("Delete cancelled")
    setShowDeleteConfirm(false)
  }

  // Confirm delete - complete implementation that deletes from all tables
  const confirmDelete = async () => {
    addDebugInfo("Delete confirmed")
    setLoading(true)
    setDeleteStatus("Starting deletion process...")

    try {
      // Get the IDs we need
      const actualVoucherId = voucherData?.voucher?.id || voucherData?.releasedVoucher?.VoucherID || voucherId

      addDebugInfo(`Using Voucher ID for deletion: ${actualVoucherId}`)

      // Step 1: Check for AdminVoucherRelease entries
      if (releasedVoucherId) {
        setDeleteStatus("Checking for AdminVoucherRelease entries...")
        const { data: adminData, error: adminCheckError } = await supabase
          .from("AdminVoucherRelease")
          .select("id")
          .eq("ReleasedVoucherID", releasedVoucherId)

        if (adminCheckError) {
          addDebugInfo(`Error checking AdminVoucherRelease: ${adminCheckError.message}`)
        } else if (adminData && adminData.length > 0) {
          // Delete from AdminVoucherRelease
          setDeleteStatus("Deleting from AdminVoucherRelease...")
          const { error: adminDeleteError } = await supabase
            .from("AdminVoucherRelease")
            .delete()
            .eq("ReleasedVoucherID", releasedVoucherId)

          if (adminDeleteError) {
            addDebugInfo(`Error deleting from AdminVoucherRelease: ${adminDeleteError.message}`)
            setDeleteError(`Failed to delete from AdminVoucherRelease: ${adminDeleteError.message}`)
            setLoading(false)
            return
          }

          addDebugInfo("Successfully deleted from AdminVoucherRelease")
        } else {
          addDebugInfo("No AdminVoucherRelease entries found")
        }
      }

      // Step 2: Delete from ReleasedVoucher
      if (releasedVoucherId) {
        setDeleteStatus("Deleting from ReleasedVoucher...")
        const { error: releasedError } = await supabase.from("ReleasedVoucher").delete().eq("id", releasedVoucherId)

        if (releasedError) {
          addDebugInfo(`Error deleting from ReleasedVoucher: ${releasedError.message}`)
          setDeleteError(`Failed to delete from ReleasedVoucher: ${releasedError.message}`)
          setLoading(false)
          return
        }

        addDebugInfo("Successfully deleted from ReleasedVoucher")
      }

      // Step 3: Delete from Customers
      if (customerId) {
        setDeleteStatus("Deleting from Customers...")
        const { error: customerError } = await supabase.from("Customers").delete().eq("id", customerId)

        if (customerError) {
          addDebugInfo(`Error deleting from Customers: ${customerError.message}`)
          setDeleteError(`Failed to delete from Customers: ${customerError.message}`)
          setLoading(false)
          return
        }

        addDebugInfo("Successfully deleted from Customers")
      }

      // Step 4: Delete from Vouchers
      setDeleteStatus("Deleting from Vouchers...")
      const { error: voucherError } = await supabase.from("Vouchers").delete().eq("id", actualVoucherId)

      if (voucherError) {
        addDebugInfo(`Error deleting from Vouchers: ${voucherError.message}`)
        setDeleteError(`Failed to delete from Vouchers: ${voucherError.message}`)
        setLoading(false)
        return
      }

      addDebugInfo("Successfully deleted from Vouchers")

      // All deletions successful
      setDeleteStatus("Deletion completed successfully!")
      addDebugInfo("All deletions completed successfully")
      setLoading(false)

      // Close the modal and navigate after a short delay
      setTimeout(() => {
        setShowDeleteConfirm(false)
        router.push("/list")
      }, 1000)
    } catch (error) {
      const errorMessage = (error as Error).message
      addDebugInfo(`Exception in confirmDelete: ${errorMessage}`)
      setDeleteError(`An error occurred: ${errorMessage}`)
      setDeleteStatus(null)
      setLoading(false)
    }
  }

  const handleBackPress = () => {
    // Navigate to the list page instead of going back
    router.push("/list")
  }

  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const __DEV__ = process.env.NODE_ENV === "development"

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
        <Text style={styles.sectionTitle}>Update Existing Vouchers</Text>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.subtitleTitleContainer}>
        <Text style={styles.subtitle}>Edit the information for this generated voucher.</Text>
      </View>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirm Delete</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this voucher? This action cannot be undone.
            </Text>

            {deleteStatus && <Text style={styles.statusText}>{deleteStatus}</Text>}

            {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}

            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelDelete} disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.disabledButton]}
                onPress={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {dataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#13390B" />
          <Text style={styles.loadingText}>Loading voucher data...</Text>
        </View>
      ) : !voucherExists ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Voucher not found. Please check the ID.</Text>
          <TouchableOpacity style={styles.backToListButton} onPress={handleBackPress}>
            <Text style={styles.backToListText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Recipient's First Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              placeholder="Enter first name"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <Text style={styles.label}>Recipient's Last Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              placeholder="Enter last name"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <Text style={styles.label}>Recipient's Email Address:</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter email address"
              placeholderTextColor="#999"
              editable={!loading}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Recipient's Phone Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              editable={!loading}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Recipient's Discount Benefit:</Text>
            <TextInput
              style={styles.input}
              value={formData.discount}
              onChangeText={(value) => handleInputChange("discount", value)}
              placeholder="Enter discount (e.g. 20)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.saveButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save and Update Voucher Details</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, loading && styles.disabledDeleteButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#63120E" />
                  <Text style={styles.deleteButtonText}>Deleting...</Text>
                </View>
              ) : (
                <Text style={styles.deleteButtonText}>Delete Voucher</Text>
              )}
            </TouchableOpacity>

            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>Voucher ID: {voucherId || "None"}</Text>
                <Text style={styles.debugText}>Customer ID: {customerId || "None"}</Text>
                <Text style={styles.debugText}>Released Voucher ID: {releasedVoucherId || "None"}</Text>
                <Text style={styles.debugText}>Voucher Exists: {voucherExists ? "Yes" : "No"}</Text>
                <Text style={styles.debugTitle}>Debug Log:</Text>
                {debugInfo.map((info, index) => (
                  <Text key={index} style={styles.debugLog}>
                    {info}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    flex: 1,
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
  backButton: {
    position: "absolute",
    left: 15,
    zIndex: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: width * 0.04,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: width * 0.04,
    color: "#63120E",
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: width * 0.035,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    marginBottom: 10,
  },
  backToListButton: {
    backgroundColor: "#13390B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToListText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  formContainer: {
    backgroundColor: "#F8F8F8",
    padding: 20,
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: width * 0.029,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    marginBottom: 10,
    marginLeft: 8,
  },
  label: {
    fontSize: width * 0.032,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#13390B",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: "#13390B80",
  },
  disabledDeleteButton: {
    borderColor: "#63120E80",
    color: "#63120E80",
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  deleteButton: {
    borderColor: "#63120E",
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 14,
  },
  deleteButtonText: {
    color: "#63120E",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
    marginVertical: 0,
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
  subtitleTitleContainer: {
    marginBottom: 20,
    marginLeft: 9.8,
    backgroundColor: "#F8F8F8",
  },
  debugContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
    color: "#333",
  },
  debugText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 3,
  },
  debugLog: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  // Styles for delete confirmation
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width * 0.8,
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: width * 0.05,
    fontFamily: "Manrope_700Bold",
    color: "#63120E",
    marginBottom: 10,
    textAlign: "center",
  },
  confirmText: {
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#333",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#63120E",
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
  },
})

export default EditVoucher
