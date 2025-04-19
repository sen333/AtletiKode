import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";

const generateVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
        <Text style={styles.sectionTitle}>Generate New Voucher</Text>
      </View>

      <View style={styles.horizontalLine} />

      {/* Animation */}
      <View style={styles.loadingContainer}>
        {isLoading ? (
          <>
            <LottieView
              source={require("../../assets/animations/dots-loader.json")} // Your animation file here
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.loadingText}>Generating Voucher... Please wait a moment...</Text>
          </>
        ) : (
          <>
            <LottieView
              source={require("../../assets/animations/check-success.json")} // Your checkmark animation
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.loadingText}>Voucher Generated Successfully!</Text>
          </>
        )}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    height: height * 0.14,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#fff",
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
    marginBottom: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#63120E",
    fontFamily: "Manrope_700Bold",
  },
});

export default generateVoucher;
