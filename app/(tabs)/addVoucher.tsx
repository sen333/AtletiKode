import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native"; // Updated import
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const addVoucher = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

  const navigation = useNavigation();
  
  // State to store form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    discount: '',
    voucherCode: ''
  });

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleGenerateVoucher = () => {
    navigation.navigate('reviewVoucher', { 
      voucherData: formData 
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!fontsLoaded) return null;

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
    
      <View style={styles.formContainer}>
        <Text style={styles.title}>Generate New Voucher</Text>
        <View style={styles.horizontalLine} />
        
        <Text style={styles.subtitle}>Enter the required information for the voucher. Make sure to fill it out correctly.</Text>

        <Text style={styles.label}>Recipient's First Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          placeholderTextColor="#999"
          value={formData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
        />

        <Text style={styles.label}>Recipient's Last Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          placeholderTextColor="#999"
          value={formData.lastName}
          onChangeText={(text) => handleInputChange('lastName', text)}
        />

        <Text style={styles.label}>Recipient's Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Recipient's Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          value={formData.phoneNumber}
          onChangeText={(text) => handleInputChange('phoneNumber', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Recipient's Discount Benefit:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter discount (e.g. 20%)"
          placeholderTextColor="#999"
          value={formData.discount}
          onChangeText={(text) => handleInputChange('discount', text)}
        />

        <Text style={styles.label}>Atletika Event Voucher Code (ATK-XXX):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the event's voucher code"
          placeholderTextColor="#999"
          value={formData.voucherCode}
          onChangeText={(text) => handleInputChange('voucherCode', text)}
        />

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateVoucher}
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
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#F2F2F2",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: width * 0.048,
    color: "#13390B",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: width * 0.029,
    color: "#555",
    fontFamily: "Manrope_400Regular",
    marginBottom: 5,
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
  horizontalLine: {
    height: 1,
    backgroundColor: "darkgreen",
    width: "100%",
    alignSelf: "center",
    marginVertical: 0,
  },

});


export default addVoucher