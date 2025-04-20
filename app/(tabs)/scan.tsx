import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  AppState,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";

const { width, height } = Dimensions.get("window");
const scanBoxSize = width * 0.7;

const ScanScreen = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false; // Reset the lock when the app comes to the foreground
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!fontsLoaded) return null;
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Scan Voucher QR Code</Text>
      </View>
      <View style={styles.horizontalLine} />

      <Text style={styles.subtitle}>
        Once a valid voucher is scanned, it will be treated as a claimed
        voucher.
      </Text>
      {/* Camera */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={({ data }) => {
            if (typeof data === "string" && !qrLock.current) {
              qrLock.current = true;
              setTimeout(() => {
                Linking.openURL(data).catch((err) =>
                  console.error("Failed to open URL:", err)
                );
              }, 500); // optional delay
            }
          }}
        >
          {/* Dim Background + Scan Box */}
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
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.flipText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  permissionText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
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
  },
  header: {
    height: height * 0.14,
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
  cameraWrapper: {
    height: height * 0.7, // Fixed height to prevent overflow
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
    bottom: 136,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
});

export default ScanScreen;
