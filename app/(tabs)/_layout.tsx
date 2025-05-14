import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

const { width } = Dimensions.get('window'); // Get screen width

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000', // Set active tab color
        tabBarInactiveTintColor: 'gray', // Set inactive tab color
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          alignContent: 'center',
          justifyContent: 'center',
          paddingTop: 10,
          height: 70, // Increase height for better spacing
        },
        tabBarLabelStyle: {
          fontSize: width * 0.035, // Adjust font size for responsiveness
        },
      }}
    >
      {/* Hidden Login Tab */}
      <Tabs.Screen
        name="index"
        options={{
        href: null, // Ensure the route is accessible
        tabBarStyle: { display: 'none' }, // Still hide it from the tab bar
      }}
      />

      {/* Home Tab */}
      <Tabs.Screen
        name="list"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Entypo name="home" size={28} color={color} />, // Slightly larger icon
        }}
      />

      {/* Events Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Events',
          tabBarLabel: 'Events',
          tabBarIcon: ({ color }) => <Entypo name="list" size={28} color={color} />, // Slightly larger icon
        }}
      />

      {/* Scan Tab */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
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
          tabBarLabel: 'Add Voucher',
          tabBarIcon: ({ color }) => <Entypo name="add-to-list" size={28} color={color} />,
        }}
      />

      {/* Logout Tab */}
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarLabel: 'Logout',
          tabBarIcon: ({ color }) => <Entypo name="log-out" size={28} color={color} />,
        }}
      />

      {/* Hidden Tabs */}
      <Tabs.Screen
        name="editVoucher"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reviewVoucher"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="generateVoucher"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 12,
    width: 70, // Adjust size for better visibility
    height: 70,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 10, // Float above the tab bar
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});