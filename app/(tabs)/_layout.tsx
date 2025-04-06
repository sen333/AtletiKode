import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'dark', // Set a static color for active tab
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarInactiveTintColor: 'gray', // Set a static color for inactive tab
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          alignContent: 'center',
          justifyContent: 'center',
          paddingTop: 10,
        },
      }}
    >
      {/* Login Tab */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // completely hide from tab bar
          tabBarStyle: { display: 'none' },
        }}
      />
       {/* Home Tab */}
       <Tabs.Screen
        name="list"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />,
        }}
      />


      {/* Add Voucher Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Entypo name="list" size={24} color={color} />,
        }}
      />

      {/* Scan Tab */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <View style={styles.floatingIcon}>
              <MaterialCommunityIcons name="qrcode-scan" size={36} color={color} />
            </View>
          ),
        }}
      />

      {/* Add Voucher Tab */}
      <Tabs.Screen
        name="addVoucher"
        options={{
          title: 'Add Voucher',
          tabBarIcon: ({ color }) => <Entypo name="add-to-list" size={24} color={color} />,
        }}
      />

      {/* Logout Tab */}
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color }) => <Entypo name="log-out" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 12   ,
    width:60,
    height: 60,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 8, // Float above the tab bar
    alignSelf: 'center',
  },
});