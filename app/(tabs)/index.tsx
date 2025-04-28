import React, { useState } from "react";
import { 
  StatusBar, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView,
  Alert,
  Switch
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Visual-only state
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    console.log("Logging in with:", { username, password });
    const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
    });
    setLoading(false);
    if (error) {
        Alert.alert(error.message);
    }
    else {
        navigation.navigate('list'); 
    }
    
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#63120E" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Image source={require("../../assets/images/logo2.png")} style={styles.logo} />
            <Text style={styles.title}>AtletiKode</Text>
            <Text style={styles.subtitle}>UP Mindanao Atletika's Voucher Management System</Text>
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
            
            {/* Visual-only Remember Me checkbox */}
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: "#767577", true: "#63120E" }}
                thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
              />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Log in as Atletika Admin</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    color: '#63120E',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#63120E",
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  rememberMeText: {
    fontFamily: "Manrope_400Regular",
    color: "#63120E",
    fontSize: 14,
    marginLeft: 10,
  },
});

export default LoginScreen;