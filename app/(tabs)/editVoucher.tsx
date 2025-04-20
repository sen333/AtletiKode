import React, { useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const EditVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
        <Text style={styles.sectionTitle}>Update Existing Vouchers</Text>
      </View>

      <View style={styles.horizontalLine} />

      <View style={styles.subtitleTitleContainer}>
        <Text style={styles.subtitle}>
          Edit the information for this generated voucher.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Recipient’s First Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Recipient’s Last Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Recipient’s Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Recipient’s Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Recipient’s Discount Benefit:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter discount (e.g. 20%)"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>
            Save and Update Voucher Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Voucher</Text>
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
    height: height * 0.14,
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
  formContainer: {
    backgroundColor: "#F8F8F8",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
});

export default EditVoucher;
