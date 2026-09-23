import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomSheetProvider } from '@swmansion/react-native-bottom-sheet';

import { CountryScreen } from './src/CountryScreen';
import { SHEET_TAB_COUNT } from './src/config';

const FeedHome = () => (
  <CountryScreen title="Feed" withSheet={SHEET_TAB_COUNT > 0} />
);
const TicketsHome = () => (
  <CountryScreen title="Tickets" withSheet={SHEET_TAB_COUNT > 1} />
);
const ChatsHome = () => (
  <CountryScreen title="Chats" withSheet={SHEET_TAB_COUNT > 2} />
);
const ProfileHome = () => (
  <CountryScreen title="Profile" withSheet={SHEET_TAB_COUNT > 3} />
);

const stackOptions = { headerShown: false };

const FeedStack = createNativeStackNavigator({
  screenOptions: stackOptions,
  screens: { FeedHome },
});
const TicketsStack = createNativeStackNavigator({
  screenOptions: stackOptions,
  screens: { TicketsHome },
});
const ChatsStack = createNativeStackNavigator({
  screenOptions: stackOptions,
  screens: { ChatsHome },
});
const ProfileStack = createNativeStackNavigator({
  screenOptions: stackOptions,
  screens: { ProfileHome },
});

const Tabs = createNativeBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarLabelVisibilityMode: 'labeled',
    tabBarActiveTintColor: '#FFD600',
    tabBarInactiveTintColor: '#8A8A8A',
    tabBarStyle: { backgroundColor: '#1B1E22' },
  },
  screens: {
    Feed: { screen: FeedStack, options: { title: 'Feed' } },
    Tickets: { screen: TicketsStack, options: { title: 'Tickets' } },
    Chats: { screen: ChatsStack, options: { title: 'Chats' } },
    Profile: { screen: ProfileStack, options: { title: 'Profile' } },
  },
});

const Navigation = createStaticNavigation(Tabs);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <BottomSheetProvider>
        <Navigation />
      </BottomSheetProvider>
    </SafeAreaProvider>
  );
}
