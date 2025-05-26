import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRoute, useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { captureRef } from "react-native-view-shot";

const dotsLoader = require("../../assets/animations/dots-loader.json");
const checkSuccess = require("../../assets/animations/check-success.json");

const GenerateVoucher = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { generatedData } = route.params as { generatedData: any };
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const qrRef = useRef<View>(null);

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
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendEmail = async () => {
    try {
      const base64 = await captureRef(qrRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });

      const cleanBase64 = base64.replace(/^data:image\/png;base64,/, "");

      const response = await fetch("https://kaqwljgkbeqyotgegusj.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: generatedData.email,
          firstName: generatedData.firstName,
          lastName: generatedData.lastName,
          base64Image: cleanBase64,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("Success", "QR code sent to the recipient's email.");
      } else {
        Alert.alert("Error", "Failed to send the QR code.");
      }
    } catch (error) {
      console.error("Error sending QR code:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleBackToAddVoucher = () => {
    navigation.navigate("addVoucher");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voucher Successfully Generated!</Text>
      <Text style={styles.subtitle}>Scan or save the QR code below:</Text>

      <View ref={qrRef} style={styles.qrContainer}>
        {isLoading ? (
          <LottieView source={dotsLoader} autoPlay loop style={{ width: 150, height: 150 }} />
        ) : showSuccess ? (
          <LottieView source={checkSuccess} autoPlay loop={false} style={{ width: 150, height: 150 }} />
        ) : (
          <QRCode value={qrValue} size={200} />
        )}
      </View>

      <Text style={styles.infoLabel}>Voucher Info:</Text>
      <Text style={styles.infoText}>Name: {generatedData.firstName} {generatedData.lastName}</Text>
      <Text style={styles.infoText}>Email: {generatedData.email}</Text>
      <Text style={styles.infoText}>Phone: {generatedData.phoneNumber}</Text>
      <Text style={styles.infoText}>Discount: {generatedData.discount}</Text>
      <Text style={styles.infoText}>Voucher Code: {generatedData.voucherCode}</Text>

      <TouchableOpacity style={styles.backButton} onPress={handleSendEmail}>
        <Text style={styles.backButtonText}>Send QR Code via Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={handleBackToAddVoucher}>
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