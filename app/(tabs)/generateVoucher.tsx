import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRoute, useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { captureRef } from "react-native-view-shot";
import Modal from "react-native-modal";
import { supabase } from "../lib/supabase"; 
import { Buffer } from "buffer";

const dotsLoader = require("../../assets/animations/dots-loader.json");
const checkSuccess = require("../../assets/animations/check-success.json");
const voucherLayoutSrc = require("../../assets/images/voucherLayout.png");

// Voucher Layout Dimensions
const TEMPLATE_WIDTH = 4300;  // voucher layout width
const TEMPLATE_HEIGHT = 1604; // voucher layout height
const SCALE = (Dimensions.get("window").width * 0.8) / TEMPLATE_WIDTH;

const GenerateVoucher = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { generatedData } = route.params as { generatedData: any };

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const qrRef = useRef<View>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Supabase‐fetched ticket info
  const [voucherInfo, setVoucherInfo] = useState<{
    voucherID: string;
    eventID:   string;
    discount:  number;
  } | null>(null);

  // Refs for capturing views
  const ticketRef = useRef<View>(null);

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

    // Fetch voucherID, eventID & discount in one call
    const fetchVoucherInfo = async () => {
      const { data, error } = await supabase
        .from("ReleasedVoucher")
        .select(`
          VoucherID,
          EventID,
          Vouchers ( discount )
        `)
        .eq("VoucherID", generatedData.voucherID)
        .single();

      if (error || !data) {
        console.error("Error fetching voucher info:", error);
        showModal(
          "Error",
          "Could not load voucher details. Please try again later.",
          false
        );
        return;
      }

      setVoucherInfo({
        voucherID: data.VoucherID,
        eventID:   data.EventID,
        discount:  data.Vouchers.discount,
      });
    };

    fetchVoucherInfo();

    return () => clearTimeout(timer);
  }, []);

  const showModal = (title: string, message: string, success: boolean = true) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const uploadQRImage = async (base64Image: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('qr-codes')
      .upload(`user_qrs/${fileName}.png`, Buffer.from(base64Image, 'base64'), {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicURL } = supabase.storage
      .from("qr-codes")
      .getPublicUrl(`user_qrs/${fileName}.png`);

    return publicURL.publicUrl;
  };

// Create a new ImageBackground component with the voucher layout
  const voucherLayout = (
    <ImageBackground
      source={voucherLayoutSrc}
      style={[styles.background, { transform: [{ scale: SCALE }] }]}
      imageStyle={styles.backgroundImage}
      collapsable={false}
    >
      {/* Overlay the QR code */}
      <View style={[styles.qrOverlay, { transform: [{ scale: SCALE }] }]}>
        <QRCode value={qrValue!} size={200} />
      </View>
      {/* Overlay the event ID */}
      <Text style={[styles.eventOverlay, { transform: [{ scale: SCALE }] }]}>Event: {voucherInfo.eventID}</Text>
      {/* Overlay the discount value */}
      <Text style={[styles.discountOverlay, { transform: [{ scale: SCALE }] }]}>{voucherInfo.discount}%</Text>
    </ImageBackground>
  );

  // Capture the voucher layout (background + overlays) as a single image
  const generateVoucherImage = async (): Promise<string> => {
    if (!voucherInfo) {
      throw new Error("Voucher info not loaded yet.");
    }

  // Capture the voucher layout as a single image
  const base64 = await captureRef(voucherLayout, {
    format: "png",
    quality: 1,
    result: "base64",
  });

    if (!base64) throw new Error("Failed to capture ticket image.");
    return base64;
  };

  const handleSendEmail = async () => {
    try {
      showModal("Sending...", "Preparing to send your QR code via email.");

      const base64Ticket = await generateVoucherImage();

      if (!base64Ticket) {
        throw new Error("Failed to capture Voucher.");
      }

      const fileName = `${voucherInfo.voucherID}-${Date.now()}`;
      const imageUrl = await uploadQRImage(base64Ticket, fileName);

      const payload = {
        email: generatedData.email,
        firstName: generatedData.firstName,
        lastName: generatedData.lastName,
        qrImageUrl: imageUrl, 
      };

      const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcXdsamdrYmVxeW90Z2VndXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDcyNDM1NywiZXhwIjoyMDYwMzAwMzU3fQ.r2VZPB8kFXkwmQ4L6EehmyJcugQ7oJmAaRpJGAO2uDQ'; // Replace with your secure value

      const response = await fetch("https://kaqwljgkbeqyotgegusj.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        showModal("Success", "AtletiKode Voucher has been sent to the recipient's email.", true);
      } else {
        showModal("Error", `Failed to send the QR code: ${result.error}`, false);
      }
    } catch (error: any) {
      showModal("Error", `Something went wrong: ${error.message}`, false);
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
          voucherLayout
        )}
      </View>

      <Text style={styles.infoLabel}>Voucher Info:</Text>
      <Text style={styles.infoText}>Name: {generatedData.firstName} {generatedData.lastName}</Text>
      <Text style={styles.infoText}>Email: {generatedData.email}</Text>
      <Text style={styles.infoText}>Phone: {generatedData.phoneNumber}</Text>
      <Text style={styles.infoText}>Discount: {voucherInfo.discount}</Text>
      <Text style={styles.infoText}>Voucher Code: {voucherInfo.voucherID}</Text>

      <TouchableOpacity style={styles.backButton} onPress={handleSendEmail}>
        <Text style={styles.backButtonText}>Send QR Code via Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={handleBackToAddVoucher}>
        <Text style={styles.backButtonText}>Create Another Voucher</Text>
      </TouchableOpacity>

      <Modal isVisible={modalVisible} backdropOpacity={0.5}>
        <View style={styles.modalContainer}>
          <Text style={[styles.modalTitle, { color: isSuccess ? "#13390B" : "#63120E" }]}>
            {modalTitle}
          </Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: isSuccess ? "#13390B" : "#63120E" }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Voucher Layout with overlays */}
      {voucherInfo && (
        <ImageBackground
          source={voucherLayoutSrc}
          ref={ticketRef}
          style={styles.ticketContainer}
          imageStyle={styles.ticketImage}
          collapsable={false}
        >
          {/* QR overlay */}
          <View style={styles.qrOverlay}>
            <QRCode value={qrValue} size={200} />
          </View>
          {/* Discount overlay */}
          <Text style={styles.discountOverlay}>{voucherInfo.discount}%</Text>
          {/* Code overlay */}
          <Text style={styles.codeOverlay}>{voucherInfo.eventID}</Text>
        </ImageBackground>
      )}

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
    marginBottom: 5,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
  },
  subtitle: {
    fontSize: width * 0.04,
    marginBottom: 10,
    color: "#555",
    textAlign: "center",
    fontFamily: "Manrope_400Regular",
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
    marginBottom: 5,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
  },
  infoText: {
    fontSize: width * 0.035,
    color: "#333",
    marginBottom: 3,
    fontFamily: "Manrope_400Regular",
  },
  backButton: {
    backgroundColor: "#63120E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: width * 0.035,
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Manrope_700Bold',
  },
  modalMessage: {
    fontSize: width * 0.04,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Manrope_400Regular',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: "100%",
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'Manrope_700Bold',
  },
  ticketContainer: {
    position: "absolute",
    top: -9999,
    left: -9999,
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
  },
  ticketImage: {
    resizeMode: "contain",
  },
  qrOverlay: {
    position: "absolute",
    top: 296,
    left: 3242,
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  discountOverlay: {
    position: "absolute",
    top: 1250,
    left: 3230,
    fontSize: 49,
    fontFamily: "WixMadeforDisplay_800ExtraBold",
    color: "#FFAF22",
  },
  eventOverlay: {
    position: "absolute",
    top: 230,
    left: 3240,
    fontSize: 20,
    fontFamily: "WixMadeforDisplay_500Medium",
    color: "#FFFFFF",
  },
});

export default GenerateVoucher;