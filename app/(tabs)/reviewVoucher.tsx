import React, { useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import { useRoute } from '@react-navigation/native';

const ReviewVoucher = () => {
    const [fontsLoaded] = useFonts({
        Manrope_400Regular,
        Manrope_700Bold,
    });

    const navigation = useNavigation();

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
            <View style={styles.reviewContainer}>
                <Text style={styles.title}>Review Voucher</Text>
                <View style={styles.horizontalLine} />
                
                <Text style={styles.subtitle}>Review the following information</Text>
                
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Recipient’s First Name: </Text>
                        <Text style={styles.infoSubtext}>{voucherData.firstName} </Text>
                    
                    <Text style={styles.infoText}>Recipient’s Last Name: </Text>
                        <Text style={styles.infoSubtext}>{voucherData.lastName} </Text>
                    
                    <Text style={styles.infoText}>Recipient’s Email: </Text>
                        <Text style={styles.infoSubtext}>{voucherData.email} </Text>
                    
                    <Text style={styles.infoText}>Recipient’sPhone: </Text>
                        <Text style={styles.infoSubtext}>{voucherData.phoneNumber} </Text>
                    
                    <Text style={styles.infoText}>Recipient’s Discount: </Text>
                        <Text style={styles.infoSubtext}>{voucherData.discount}</Text>
                    
                    <Text style={styles.infoText}>Recipient’s Voucher Code:</Text>
                        <Text style={styles.infoSubtext}> {voucherData.voucherCode}</Text>
                </View>
                
                <Text style={styles.reviewReminder}>
                    The presented information will be saved when you generate this voucher.
                </Text>

                <TouchableOpacity style={styles.generateButton}>
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
    reviewContainer: {
        backgroundColor: "#F2F2F2",
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        paddingBottom: 150,
    },
    title: {
        fontSize: width * 0.048,
        color: "#13390B",
        fontWeight: "bold",
        fontFamily: "Manrope_700Bold",
        marginBottom: 8,
    },
    horizontalLine: {
        height: 1,
        backgroundColor: "darkgreen",
        width: "100%",
        alignSelf: "center",
        marginVertical: 0,
    },
    subtitle: {
        fontSize: width * 0.029,
        color: "#555",
        fontFamily: "Manrope_400Regular",
        marginBottom: 10,
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
});

export default ReviewVoucher;