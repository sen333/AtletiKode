import React, { useEffect, useLayoutEffect } from "react";
import {supabase} from "../lib/supabase";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import { useRoute } from "@react-navigation/native";

const ReviewVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const navigation = useNavigation(); // Initialize navigation
  const route = useRoute();
  const { voucherData } = route.params as { voucherData: any };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

    // We are now inserting the data to the database
    const submitData = async () => {
    console.log(JSON.stringify(voucherData.EventID)); // to see the exact raw value
  
  
      // we insert first to customers table
      const {data : custID, error : error_insertingCustomer} = await supabase
       .from("Customers")
       .insert([{
        "FirstName" : voucherData.firstName,
        "LastName" : voucherData.lastName,
        "Email" : voucherData.email,
        "ContactNumber" : voucherData.phoneNumber
       }])
       .select('*')
       ;
  
      if (error_insertingCustomer) {
        console.log("Error inserting data: " + error_insertingCustomer.message);
        return;
      }
  
      const customerID = custID && custID[0] ? custID[0].id : null;
  
      // We insert to voucher table
      const {data : temp_vouchID, error : error_insertingVoucher} = await supabase
       .from("Vouchers")
       .insert([{
        "Discount" : voucherData.discount,
        "Status" : "Unclaimed",
       }])
        .select('*')
       ;
  
      if (error_insertingVoucher) {
        console.log("Error inserting data: " + error_insertingVoucher.message);
        return;
      }
  
      const voucherID = temp_vouchID && temp_vouchID[0] ? temp_vouchID[0].id : null;
  
      // We insert to released voucher table
      const {data : temp_releasedID, error : error_insertingReleased} = await supabase
       .from("ReleasedVoucher")
       .insert([{
        "CustomerID" : customerID,
        "VoucherID" : voucherID, 
        "EventID" : voucherData.voucherCode
       }])
       .select('*')
       ;
  
      if (error_insertingReleased) {
        console.log("Error inserting data: " + error_insertingReleased.message);
        return;
  
      }
  
  
      const releasedID = temp_releasedID && temp_releasedID[0] ? temp_releasedID[0].id : null;
      navigation.navigate("generateVoucher")
    }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#63120E", "#4A0707"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/logo2.png")}
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AtletiKode</Text>
            <Text style={styles.headerSubtitle}>
              UP Mindanao Atletika's Voucher Management System
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Generate New Voucher</Text>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.subtitleTitleContainer}>
        <Text style={styles.subtitle}>Review the following information.</Text>
      </View>

      <View style={styles.reviewContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Recipient’s First Name: </Text>
          <Text style={styles.infoSubtext}>{voucherData.firstName} </Text>

          <Text style={styles.infoText}>Recipient’s Last Name: </Text>
          <Text style={styles.infoSubtext}>{voucherData.lastName} </Text>

          <Text style={styles.infoText}>Recipient’s Email: </Text>
          <Text style={styles.infoSubtext}>{voucherData.email} </Text>

          <Text style={styles.infoText}>Recipient’s Phone: </Text>
          <Text style={styles.infoSubtext}>{voucherData.phoneNumber} </Text>

          <Text style={styles.infoText}>Recipient’s Discount: </Text>
          <Text style={styles.infoSubtext}>{voucherData.discount}</Text>

          <Text style={styles.infoText}>Recipient’s Voucher Code:</Text>
          <Text style={styles.infoSubtext}> {voucherData.voucherCode}</Text>
        </View>

        <Text style={styles.reviewReminder}>
          The presented information will be saved when you generate this
          voucher.
        </Text>

        {/* Navigate to generateVoucher */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => submitData()}
        >
          <Text style={styles.generateButtonText}>Generate Voucher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

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
  reviewContainer: {
    marginTop: 8,
    padding: 20,
    paddingBottom: 150,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
    marginVertical: 0,
  },
  subtitleTitleContainer: {
    marginBottom: 4,
    marginLeft: 9.8,
    backgroundColor: "#F8F8F8",
  },
  subtitle: {
    fontSize: width * 0.029,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    marginLeft: 9.8,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderColor: "#13390B",
    borderWidth: 1,
  },
  infoText: {
    fontSize: width * 0.032,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    marginBottom: 5,
  },
  infoSubtext: {
    fontSize: width * 0.032,
    color: "#555",
    fontFamily: "Manrope_400Regular",
    marginBottom: 8,
    paddingLeft: 20,
  },
  reviewReminder: {
    fontSize: width * 0.025,
    color: "#555",
    fontFamily: "Manrope_400Regular",
    marginTop: 10,
    textAlign: "center",
  },
  generateButton: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  generateButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    fontSize: width * 0.035,
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
});

export default ReviewVoucher;
