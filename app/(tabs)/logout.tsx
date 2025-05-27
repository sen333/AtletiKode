import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Logout = () => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
    const timer = setTimeout(() => {
        setModalVisible(true);
      }, 600);

      return () => clearTimeout(timer);
    }, [])
  );

  const handleCancel = () => {
    setModalVisible(false);
    router.replace('/list'); // Redirect back to Home if canceled
  };

  const handleLogout = () => {
    setModalVisible(false);
    console.log('Navigating to /tabs');
    router.replace('/(tabs)'); // Redirect to the login or landing page
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient colors={['#63120E', '#4A0707']} style={styles.header}>
        <Image
          source={require('../../assets/images/logo2.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>AtletiKode</Text>
        <Text style={styles.subtitle}>
          UP Mindanao Atletika's Voucher Management System
        </Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message}>Logging you out...</Text>
      </View>

      {/* Custom Modal */}
      <Modal isVisible={isModalVisible} backdropOpacity={0.5}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Logout</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: 10,
  },
  title: {
    fontSize: width * 0.06,
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'Manrope_700Bold',
  },
  subtitle: {
    fontSize: width * 0.035,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Manrope_400Regular',
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: width * 0.045,
    color: '#13390B',
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#13390B',
    marginBottom: 10,
    fontFamily: 'Manrope_700Bold',
  },
  modalMessage: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Manrope_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: width * 0.04,
    fontFamily: 'Manrope_700Bold',
  },
  logoutButton: {
    backgroundColor: '#63120E',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    fontFamily: 'Manrope_700Bold',
  },
});

export default Logout;