import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../constants/types"; // adjust if path differs

import { Buffer } from "buffer";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import { supabase } from "../lib/supabase";

const voucherTemplate = require("../../assets/images/New.png");
const dotsLoader = require("../../assets/animations/dots-loader.json");
const checkSuccess = require("../../assets/animations/check-success.json");

type NavigationProp = StackNavigationProp<RootStackParamList, "generateVoucher">;
type RouteParams = RouteProp<RootStackParamList, "generateVoucher">;

const GenerateVoucher = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { generatedData } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const qrRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

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
      setTimeout(() => setShowSuccess(false), 2000);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const showModal = (title: string, message: string, success: boolean = true) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const uploadQRImage = async (base64Image: string, fileName: string) => {
    const { error } = await supabase.storage
      .from("qr-codes")
      .upload(`user_qrs/${fileName}.png`, Buffer.from(base64Image, "base64"), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data: publicURL } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(`user_qrs/${fileName}.png`);

    return publicURL.publicUrl;
  };

  const handleSendEmail = async () => {
    try {
      showModal("Sending...", "Preparing to send your QR code via email.");

      const base64 = await captureRef(qrRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });

      if (!base64) throw new Error("Failed to capture QR code");

      const fileName = `${generatedData.voucherID}-${Date.now()}`;
      const imageUrl = await uploadQRImage(base64, fileName);

      const payload = {
        email: generatedData.email,
        firstName: generatedData.firstName,
        lastName: generatedData.lastName,
        qrImageUrl: imageUrl,
      };

      const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcXdsamdrYmVxeW90Z2VndXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDcyNDM1NywiZXhwIjoyMDYwMzAwMzU3fQ.r2VZPB8kFXkwmQ4L6EehmyJcugQ7oJmAaRpJGAO2uDQ"; // 🔐 Use secure env in production

      const response = await fetch(
        "https://kaqwljgkbeqyotgegusj.supabase.co/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success)
        showModal("Success", "QR code sent via email.", true);
      else showModal("Error", `Failed to send email: ${result.error}`, false);
    } catch (error: any) {
      showModal("Error", error.message, false);
    }
  };

  const handleBackToAddVoucher = () => navigation.navigate("addVoucher");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.centeredWrapper}>
        <Text style={styles.title}>Voucher Successfully Generated!</Text>
        <Text style={styles.subtitle}>Scan or save the QR code below:</Text>

        <View ref={qrRef} collapsable={false} style={styles.voucherWrapper}>
          <ImageBackground source={voucherTemplate} style={styles.voucherImage} resizeMode="contain">
            {isLoading ? (
              <LottieView source={dotsLoader} autoPlay loop style={{ width: 60, height: 60 }} />
            ) : showSuccess ? (
              <LottieView source={checkSuccess} autoPlay loop={false} style={{ width: 60, height: 60 }} />
            ) : (
              <>
                <View style={styles.qrCodeBox}>
                  <QRCode value={qrValue} size={58} />
                </View>
                <Text style={styles.percentageText}>{generatedData.discount}% OFF</Text>
                <Text style={styles.voucherCodeTop}>{generatedData.voucherCode}</Text>
              </>
            )}
          </ImageBackground>
        </View>

        <Text style={styles.infoLabel}>Voucher Info:</Text>
        <Text style={styles.infoText}>Name: {generatedData.firstName} {generatedData.lastName}</Text>
        <Text style={styles.infoText}>Email: {generatedData.email}</Text>
        <Text style={styles.infoText}>Phone: {generatedData.phoneNumber}</Text>
        <Text style={styles.infoText}>Discount: {generatedData.discount}% OFF</Text>
        <Text style={styles.infoText}>Voucher Code: {generatedData.voucherCode}</Text>

        <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
          <Text style={styles.buttonText}>Send QR Code via Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleBackToAddVoucher}>
          <Text style={styles.buttonText}>Create Another Voucher</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={modalVisible} backdropOpacity={0.5}>
        <View style={styles.modalContainer}>
          <Text style={[styles.modalTitle, { color: isSuccess ? "#13390B" : "#63120E" }]}> {modalTitle} </Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: isSuccess ? "#13390B" : "#63120E" }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F8F8",
  },
  centeredWrapper: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#555",
    marginBottom: 16,
    fontFamily: "Manrope_400Regular",
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
    top: 20,
    left: 221,
    width: 59,
    height: 57,
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
  infoLabel: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
  },
  infoText: {
    fontSize: width * 0.035,
    color: "#333",
    marginBottom: 3,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.035,
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Manrope_700Bold",
  },
  modalMessage: {
    fontSize: width * 0.04,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Manrope_400Regular",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
});

export default GenerateVoucher;
