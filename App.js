import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './context/ThemeContext';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { getStateFromPath } from '@react-navigation/native';
import { supabase } from './lib/supabase';



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
export const navigationRef = createNavigationContainerRef()



function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>


      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />

      <Stack.Screen name="Tabnavigator" component={Tabnavigator} />
      
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="Barcodescanner" component={Barcodescanner} />
      <Stack.Screen name="Storelocator" component={Storelocator} />
      <Stack.Screen name="Imagepicker" component={Imagepicker} />
      <Stack.Screen name="Orderhistory" component={Orderhistory} />

    </Stack.Navigator>
  );
}

const linking = {
  prefixes: [
    'shopapp://',
    'exp://192.168.1.18:8081/--',
    'exp://192.168.1.18:8081',   
  ],
  config: {
    screens: {
      Tabnavigator: {
        screens: {
          Home: 'home',
          Products: 'products',
          Cart: 'cart',
          Wishlist: 'wishlist',
          Profile: 'profile',
        }
      },
      Welcome:      'welcome',
      Login:        'login',
      Register:     'register',
      Checkout:     'checkout',
      Barcodescanner: 'barcode',
      Storelocator: 'stores',
    }
  },

  getStateFromPath: (path, options) => {
    console.log('🔗 Deep link path received:', path);
    return getStateFromPath(path, options);
  }
}



export default function App() {

  useEffect(() => {
    Notifications.requestPermissionsAsync()

    // listen for auth changes — handles logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigationRef.current?.navigate('Welcome')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onReady={() => {
          // onReady fires AFTER navigation is mounted — safe to navigate here
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              navigationRef.current?.navigate('Tabnavigator')
            }
            // if no session, stay on Welcome (it's the first screen)
          })
        }}
      >
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