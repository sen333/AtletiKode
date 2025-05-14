import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import Feather from "@expo/vector-icons/Feather";
import { Dimensions } from "react-native";

SplashScreen.preventAutoHideAsync();

const events = Array.from({ length: 1 }, (_, i) => ({
  id: `ATK-00${i + 1}`,
  title: "EVENT TITLE",
  vouchers: 555,
}));

const EventCard = ({ event }) => (
  <View style={styles.card}>
    <View>
      <Text style={styles.eventCode}>{event.id}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
    </View>
    <View style={styles.rightSection}>
      <View>
        <Text style={styles.voucherCount}>{event.vouchers}</Text>
        <Text style={styles.voucherLabel}>Released Vouchers</Text>
      </View>
    </View>
    <TouchableOpacity>
      <Feather name="trash-2" size={24} color="gray" style={styles.trashIcon} />
    </TouchableOpacity>
  </View>
);

const explore = () => {
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
        <Text style={styles.sectionTitle}>Event Vouchers</Text>
      </View>

      <View style={styles.horizontalLine} />

      {/* Event List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </View>
  );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
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
  horizontalLine: {
    height: 1,
    backgroundColor: "#13390B",
    width: "92%",
    alignSelf: "center",
    marginVertical: 0,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: width * 0.04, // 4% of screen width
    marginBottom: width * 0.03, // 3% of screen width
    elevation: 3,
    width: "92%",
    alignSelf: "center",
    borderColor: "#13390B",
    borderWidth: 1,
  },
  eventCode: {
    fontSize: width * 0.03, // 3% of screen width
    color: "#13390B",
  },
  eventTitle: {
    fontSize: width * 0.045, // 4.5% of screen width
    fontWeight: "bold",
    color: "#13390B",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  voucherCount: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "bold",
    color: "#13390B",
    textAlign: "center",
  },
  voucherLabel: {
    fontSize: width * 0.025, // 2.5% of screen width
    color: "#13390B",
    textAlign: "right",
  },
  trashIcon: {
    marginLeft: 10,
  },
});

export default explore;
