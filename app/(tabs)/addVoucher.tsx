import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const AddVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const navigation = useNavigation();

  // State to store form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    discount: "",
    voucherCode: "",
  });

  // Reset form fields when the page gains focus
  useFocusEffect(
    React.useCallback(() => {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        discount: "",
        voucherCode: "",
      });
    }, [])
  );


  // Define form fields as an array
  const formFields = [
    { key: "firstName", label: "Recipient's First Name", placeholder: "Enter first name" },
    { key: "lastName", label: "Recipient's Last Name", placeholder: "Enter last name" },
    { key: "email", label: "Recipient's Email Address", placeholder: "Enter email address", keyboardType: "email-address" },
    { key: "phoneNumber", label: "Recipient's Phone Number", placeholder: "Enter phone number", keyboardType: "phone-pad" },
    { key: "discount", label: "Recipient's Discount Benefit", placeholder: "Enter discount (e.g. 20%)" },
    { key: "voucherCode", label: "Atletika Event Voucher Code (ATK-XXX)", placeholder: "Enter the event's voucher code" },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleGenerateVoucher = () => {
    navigation.navigate("reviewVoucher", {
      voucherData: formData,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        <Text style={styles.subtitle}>
          Enter the required information for the voucher. Make sure to fill it
          out correctly.
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {formFields.map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}:</Text>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.inputTouchable}
              onPress={() => {
                // This empty onPress helps improve touchability
              }}
            >
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#999"
                value={formData[field.key]}
                onChangeText={(text) => handleInputChange(field.key, text)}
                keyboardType={field.keyboardType || "default"}
              />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateVoucher}
        >
          <Text style={styles.generateButtonText}>Generate Voucher</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 1,
  },
  subtitleTitleContainer: {
    marginBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: "#F8F8F8",
  },
  subtitle: {
    fontSize: width * 0.026,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    textAlign: "left",
  },
  label: {
    fontSize: width * 0.032,
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    marginBottom: 8,
  },
  inputTouchable: {
    width: "100%",
  },
  input: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: width * 0.035,
    fontFamily: "Manrope_400Regular",
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 40,
  },
  generateButton: {
    backgroundColor: "#63120E",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButtonText: {
    color: "#fff",
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
});

export default AddVoucher;