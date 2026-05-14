import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './context/ThemeContext';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import Welcome from './screens/Welcome';
import Login from './screens/Login';
import Register from './screens/Register';
import Barcodescanner from './screens/Barcodescanner';
import Storelocator from './screens/Storelocator';
import Checkout from './screens/Checkout';
import Tabnavigator from './navigation/Tabnavigator';
import Imagepicker from './screens/Imagepicker';
import Orderhistory from './screens/Orderhistory';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="Tabnavigator" component={Tabnavigator} />

      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="Barcodescanner" component={Barcodescanner} />
      <Stack.Screen name="Storelocator" component={Storelocator} />
      <Stack.Screen name="Imagepicker" component={Imagepicker} />
      <Stack.Screen name="Orderhistory" component={Orderhistory} />

    </Stack.Navigator>
  );
}


export default function App() {

  useEffect(() => {
    Notifications.requestPermissionsAsync()
  },
  [])

  return (

<ThemeProvider>
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  </ThemeProvider>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});