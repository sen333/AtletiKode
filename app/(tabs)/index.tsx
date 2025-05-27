import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../constants/types";

import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { supabase } from "../lib/supabase";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "list">;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      setUsername("");
      setPassword("");
    }, [])
  );

  const handleLogin = async () => {
    setLoading(true);
    console.log("Logging in with:", { username, password });

    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    setLoading(false);

    if (error) {
      setModalMessage(error.message);
      setModalVisible(true);
    } else {
      navigation.navigate("list");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#63120E" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo2.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>AtletiKode</Text>
            <Text style={styles.subtitle}>
              UP Mindanao Atletika's Voucher Management System
            </Text>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>UP MINDANAO ATLETIKA</Text>
            <Text style={styles.loginSubtitle}>Administrator Log In</Text>

            <Text style={styles.label}>Username:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your admin username credential"
              placeholderTextColor="rgba(139, 0, 0, 0.5)"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your admin password credential"
              placeholderTextColor="rgba(139, 0, 0, 0.5)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: "#767577", true: "#63120E" }}
                thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
              />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log in as Atletika Admin</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal isVisible={isModalVisible} backdropOpacity={0.5}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Login Error</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#63120E",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingTop: 90,
    paddingBottom: 30,
  },
  logo: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    width: "100%",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100%",
  },
  loginTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: "#5C0000",
  },
  loginSubtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#5C0000",
    marginBottom: 20,
  },
  label: {
    fontFamily: "Manrope_400Regular",
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#63120E",
    marginTop: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#63120E",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    color: "#000",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#63120E",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    fontFamily: "Manrope_400Regular",
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  rememberMeText: {
    fontFamily: "Manrope_400Regular",
    color: "#63120E",
    fontSize: 14,
    marginLeft: 10,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#63120E",
    marginBottom: 10,
    fontFamily: "Manrope_700Bold",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Manrope_400Regular",
  },
  modalButton: {
    backgroundColor: "#63120E",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    width: "50%",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Manrope_700Bold",
  },
});

export default LoginScreen;
