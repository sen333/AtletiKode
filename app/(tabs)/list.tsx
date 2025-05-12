import React, { useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync();

const list = () => {
  const router = useRouter();
  const [vouchers, setVouchers] = React.useState<any[]>([]);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });

    const loadData = async () => {
    const {data : vouchers0, error : error_fetchingVouchers} = await supabase
      .from("ReleasedVoucher")
      .select('*, Vouchers(*), Customers(*)');

    if (error_fetchingVouchers) {
      console.log("Error fetching vouchers:", error_fetchingVouchers);
      return;
    }

    console.log("Fetched vouchers:", vouchers0);
    setVouchers(vouchers0 as any[]);
  }

useFocusEffect(
  React.useCallback(() => {
    if (fontsLoaded) {
      loadData()
    }
  }, [fontsLoaded])
);

  useEffect(() => {

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }

    loadData();
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

      <View>
        {vouchers.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.Vouchers.id}</Text>
            <Text style={styles.tableCell}>{item.Customers.FirstName + " " + item.Customers.LastName}</Text>
            <Text style={styles.tableCell}>{item.Customers.Email}</Text>
            <Text style={[styles.tableCell, styles.status]}>
              {item.Vouchers.Status}
            </Text>
            <Feather
              name="edit"
              size={16}
              color="#13390B"
              style={styles.tableIcon}
              onPress={() =>
                router.push({
                  pathname: "/editVoucher",
                  params: {
                    id: item.id,
                    recipient: item.recipient,
                    email: item.email,
                    status: item.status,
                  },
                })
              }
            />
          </View>
        ))}
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
  sectionTitleContainer: {
    padding: 14,
    alignSelf: "flex-start",
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
    textAlign: "left",
    marginLeft: 4,
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statBox: { alignItems: "center", backgroundColor: "#F8F8F8" },
  statNumber: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.42,
  },
  statLabel: {
    fontSize: width * 0.035,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
    letterSpacing: -0.42,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "#F8F8F8",
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
    fontSize: width * 0.035,
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
    fontSize: width * 0.028,
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
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
    marginVertical: 0,
  },
});

export default list;
