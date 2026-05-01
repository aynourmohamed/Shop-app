import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from "../screens/Home";
import Profile from "../screens/Profile";
import Cart from "../screens/Cart";
import Products from "../screens/Products";
import Wishlist from "../screens/Wishlist";

const Tab = createBottomTabNavigator();

export default function MyTabs() {
    return (
    <Tab.Navigator screenOptions= {{
    tabBarShowLabel: true,
    tabBarLabelPosition: 'below-icon',
    tabBarActiveTintColor: '#e1d8cf',
    tabBarInactiveTintColor: '#999', 
    headerShown: false,}}>

    <Tab.Screen name="Home" component={Home}
    options={{headerShown: false, tabBarIcon: ({}) => ( <Ionicons name="home-outline" size={24}/> ) }}/>

    <Tab.Screen name="Products" component={Products} 
    options={{tabBarIcon: ({}) => ( <Ionicons name="search-outline" size={24}/> ) }}/>

    <Tab.Screen name="Wishlist" component={Wishlist} 
    options={{tabBarIcon: ({}) => ( <Ionicons name="heart-outline" size={24}/> ) }}/>

    <Tab.Screen name="Cart" component={Cart} 
    options={{tabBarIcon: ({}) => ( <Ionicons name="cart-outline" size={24}/> ) }}/>

    <Tab.Screen name="Profile" component={Profile} 
    options={{tabBarIcon: ({}) => ( <Ionicons name="person-outline" size={24}/> ) }}/>
    
    </Tab.Navigator>
    );
}
