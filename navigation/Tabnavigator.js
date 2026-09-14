import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from "../screens/home";
import Profile from "../screens/profile";
import Cart from "../screens/cart";
import Products from "../screens/Products";
import Wishlist from "../screens/wishlist";
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function MyTabs() {
  const { t } = useTheme()

  return (
    <Tab.Navigator screenOptions={{
      tabBarShowLabel: true,
      tabBarLabelPosition: 'below-icon',
      tabBarActiveTintColor: '#e1d8cf',
      tabBarInactiveTintColor: '#999',
      headerShown: false,
    }}>

      <Tab.Screen name="Home" component={Home}
        options={{
          tabBarLabel: t.home,
          tabBarIcon: () => <Ionicons name="home-outline" size={24}/>
        }}/>

      <Tab.Screen name="Products" component={Products}
        options={{
          tabBarLabel: t.products,
          tabBarIcon: () => <Ionicons name="search-outline" size={24}/>
        }}/>

      <Tab.Screen name="Wishlist" component={Wishlist}
        options={{
          tabBarLabel: t.wishlist,
          tabBarIcon: () => <Ionicons name="heart-outline" size={24}/>
        }}/>

      <Tab.Screen name="Cart" component={Cart}
        options={{
          tabBarLabel: t.cart,
          tabBarIcon: () => <Ionicons name="cart-outline" size={24}/>
        }}/>

      <Tab.Screen name="Profile" component={Profile}
        options={{
          tabBarLabel: t.profile,
          tabBarIcon: () => <Ionicons name="person-outline" size={24}/>
        }}/>

    </Tab.Navigator>
  );
}