import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync();

const EventCard = ({ event, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.leftSection}>
      <Text style={styles.eventCode}>{event.id}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
    </View>
    <View style={styles.rightSection}>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherCount}>{event.totalVouchers}</Text>
        <Text style={styles.voucherLabel}>Released Vouchers</Text>
      </View>
    </View>
    <TouchableOpacity onPress={() => onDelete(event)}>
      <Feather name="trash-2" size={24} color="gray" style={styles.trashIcon} />
    </TouchableOpacity>
  </View>
);

const explore = () => {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      loadEvents();
    }
  }, [fontsLoaded]);

  const loadEvents = async () => {

    const { data: eventsData, error: eventsError } = await supabase
      .from("Events")
      .select("*");

    if (eventsError) {
      console.log("Error fetching events:", eventsError);
      return;
    }

    const { data: releasedVouchers, error: vouchersError } = await supabase
      .from("ReleasedVoucher")
      .select("EventID");

    if (vouchersError) {
      console.log("Error fetching released vouchers:", vouchersError);
      return;
    }

    const voucherCountMap: Record<string, number> = {};
    releasedVouchers.forEach((voucher: any) => {
      const eventId = voucher.EventID;
      if (eventId) {
        voucherCountMap[eventId] = (voucherCountMap[eventId] || 0) + 1;
      }
    });

    const eventsWithVouchers = eventsData.map((event: any) => ({
      id: event.id,
      title: event.Title,
      totalVouchers: voucherCountMap[event.id] || 0,
    }));

    setEvents(eventsWithVouchers);
  };

  const handleAddEvent = () => {
    setEventTitle("");
    setShowAddModal(true);
  };

  const confirmAddEvent = async () => {
    if (eventTitle.trim()) {
      await addEventToDatabase(eventTitle.trim());
      setShowAddModal(false);
      setEventTitle("");
    }
  };

  const addEventToDatabase = async (title: string) => {
    try {
      const { data: existingEvents, error: fetchError } = await supabase
        .from("Events")
        .select("id")
        .order("id", { ascending: false });

      if (fetchError) {
        console.error("Error fetching existing events:", fetchError);
        Alert.alert("Error", "Failed to add event. Please try again.");
        return;
      }

      let nextNumber = 1;
      if (existingEvents && existingEvents.length > 0) {

        const numbers = existingEvents
          .map(event => {
            const match = event.id.match(/ATK-(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }

      const nextId = `ATK-${nextNumber.toString().padStart(Math.max(3, nextNumber.toString().length), '0')}`;

      const { data, error } = await supabase
        .from("Events")
        .insert([{ id: nextId, Title: title }])
        .select();

      if (error) {
        console.error("Error adding event:", error);
        Alert.alert("Error", "Failed to add event. Please try again.");
        return;
      }

      if (data && data.length > 0) {
        loadEvents();
      }
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Error", "Failed to add event. Please try again.");
    }
  };

  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      await deleteEventFromDatabase(eventToDelete.id);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const deleteEventFromDatabase = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("Events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        Alert.alert("Error", "Failed to delete event. Please try again.");
        return;
      }

      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Failed to delete event. Please try again.");
    }
  };

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

      {/* distributed vouchers heading */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Event Vouchers</Text>
      </View>

      <View style={styles.horizontalLine} />

      {/* event list */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EventCard event={item} onDelete={handleDeleteEvent} />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* add event button fixed sa bottom */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddEvent}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* add event to */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              value={eventTitle}
              onChangeText={setEventTitle}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={confirmAddEvent}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* delit  */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{eventToDelete?.title}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteEvent}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: width * 0.04,
    marginBottom: width * 0.03,
    elevation: 3,
    width: "92%",
    alignSelf: "center",
    borderColor: "#13390B",
    borderWidth: 1,
  },
  eventCode: {
    fontSize: width * 0.03,
    color: "#13390B",
    fontFamily: "Manrope_400Regular",
  },
  eventTitle: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#13390B",
    fontFamily: "Manrope_700Bold",
  },
 leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'center',
    marginRight: 10,
    minWidth: 100, // Adjust this value as needed
  },
  voucherInfo: {
    alignItems: 'center',
  },
  voucherCount: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#13390B",
    textAlign: "center",
    fontFamily: "Manrope_700Bold",
  },
  voucherLabel: {
    fontSize: width * 0.025,
    color: "#13390B",
    textAlign: "center",
    fontFamily: "Manrope_400Regular",
  },
  trashIcon: {
    marginLeft: 10,
  },
floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#63120E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#13390B",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Manrope_700Bold",
  },
  modalMessage: {
    fontSize: width * 0.04,
    color: "#13390B",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Manrope_400Regular",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#13390B",
    borderRadius: 10,
    padding: 12,
    fontSize: width * 0.04,
    marginBottom: 20,
    fontFamily: "Manrope_400Regular",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
  },
  addButton: {
    backgroundColor: "#13390B",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
  },
  deleteButton: {
    backgroundColor: "#63120E",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.04,
    fontFamily: "Manrope_700Bold",
  },
});

export default explore;