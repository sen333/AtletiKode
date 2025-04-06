import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

SplashScreen.preventAutoHideAsync();

const vouchers = Array(10).fill({
  id: "ATK-008-2023",
  recipient: "Kyle Howard Senoy",
  email: "kyle@example.com",
  status: "UNCLAIMED",
});

const Vouchers = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

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
      {/* Header with Gradient */}
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

      {/* Distributed Vouchers Heading */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Distributed Vouchers</Text>
      </View>

      <View style={styles.horizontalLine} />

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>333</Text>
          <Text style={styles.statLabel}>Unclaimed Vouchers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>333</Text>
          <Text style={styles.statLabel}>Claimed Vouchers</Text>
        </View>
      </View>

      <View style={styles.horizontalLine} />
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Voucher ID</Text>
        <Text style={styles.tableHeaderText}>Recipient</Text>
        <Text style={styles.tableHeaderText}>Email</Text>
        <Text style={styles.tableHeaderText}>Status</Text>
        <AntDesign
          name="setting"
          size={20}
          color="#13390B"
          style={styles.tableHeaderIcon}
        />
      </View>

      <View style={styles.horizontalLine} />
      {/* Voucher List */}
      <FlatList
        data={vouchers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.id}</Text>
            <Text style={styles.tableCell}>{item.recipient}</Text>
            <Text style={styles.tableCell}>{item.email}</Text>
            <Text style={[styles.tableCell, styles.status]}>{item.status}</Text>
            <Feather
              name="edit"
              size={16}
              color="#13390B"
              style={styles.tableIcon}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    paddingRight: 70,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.42,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Manrope_400Regular",
    letterSpacing: -0.42,
  },
  sectionTitleContainer: {
    padding: 14,
    alignSelf: "flex-start",
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#fff",
    marginTop: -30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#13390B",
    textAlign: "left",
    marginLeft: 4,
    fontFamily: "Manrope_700SemiBold",
    letterSpacing: -0.6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statBox: { alignItems: "center" },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.42,
  },
  statLabel: {
    fontSize: 14,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    letterSpacing: -0.42,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "#fff",
    width: "92%",
    alignSelf: "center",
  },
  tableIcon: {
    marginLeft: 4,
  },
  tableHeaderIcon: {
    marginLeft: 0,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.4,
    color: "#13390B",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#13390B",
    width: "92%",
    alignSelf: "center",
  },
  tableCell: {
    fontSize: 12,
    flex: 1,
    textAlign: "center",
    fontFamily: "Manrope_400Regular",
    color: "#13390B",
  },
  status: {
    color: "#13390B",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "darkgreen",
    width: "92%",
    alignSelf: "center",
    marginVertical: 0,
  },
});

export default Vouchers;