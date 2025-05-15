import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRoute, useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const dotsLoader = require("../../assets/animations/dots-loader.json");
const checkSuccess = require("../../assets/animations/check-success.json");


const GenerateVoucher = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { generatedData } = route.params as { generatedData: any };

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const qrValue = JSON.stringify({
    customerID: generatedData.customerID,
    voucherID: generatedData.voucherID,
    releasedID: generatedData.releasedID,
    firstName: generatedData.firstName,
    lastName: generatedData.lastName,
    email: generatedData.email,
    phoneNumber: generatedData.phoneNumber,
    discount: generatedData.discount,
    voucherCode: generatedData.voucherCode,
  });

  useEffect(() => {
    // Simulate a delay for loading effect
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      // Hide success animation after 1 second
      setTimeout(() => setShowSuccess(false), 2200);
    }, 4000); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, []);

  const handleBackToAddVoucher = () => {
    navigation.navigate("addVoucher");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voucher Successfully Generated!</Text>
      <Text style={styles.subtitle}>Scan or save the QR code below:</Text>

     <View style={styles.qrContainer}>
  {isLoading ? (
    <LottieView
      source={dotsLoader}
      autoPlay
      loop
      style={{ width: 150, height: 150 }}
    />
  ) : showSuccess ? (
    <LottieView
      source={checkSuccess}
      autoPlay
      loop={false}
      style={{ width: 150, height: 150 }}
    />
  ) : (
    <QRCode value={qrValue} size={250} />
  )}
</View>


      <Text style={styles.infoLabel}>Voucher Info:</Text>
      <Text style={styles.infoText}>Name: {generatedData.firstName} {generatedData.lastName}</Text>
      <Text style={styles.infoText}>Email: {generatedData.email}</Text>
      <Text style={styles.infoText}>Phone: {generatedData.phoneNumber}</Text>
      <Text style={styles.infoText}>Discount: {generatedData.discount}</Text>
      <Text style={styles.infoText}>Voucher Code: {generatedData.voucherCode}</Text>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackToAddVoucher}
      >
        <Text style={styles.backButtonText}>Create Another Voucher</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#13390B",
  },
  subtitle: {
    fontSize: width * 0.04,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#13390B",
  },
  infoText: {
    fontSize: width * 0.035,
    color: "#333",
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: width * 0.035,
    fontWeight: "bold",
  },
});

export default GenerateVoucher;