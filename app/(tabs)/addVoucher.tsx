import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const addVoucher = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Voucher</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('generateVoucher')}
      >
        <Text style={styles.buttonText}>Generate Voucher</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#13390B',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default addVoucher;