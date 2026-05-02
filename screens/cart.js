import {ScrollView, View, Text, TextInput, Image, StyleSheet, FlatList} from 'react-native';
import {useState} from 'react';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage'


const Cart = () => {

  const { theme } = useTheme()

const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

  const [items, setItems] = useState([]);

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('my-key', value);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('my-key');
      if (value !== null) {
        // value previously stored
      }
    } catch (e) {
      // error reading value
    }
  };

  return(
    <View style={[styles.screen, { backgroundColor: background }]}>

            {/* logo */}
            <View style={styles.logo}>
                <Image source={require('../assets/images/logo no bg.png')}
                style={styles.logo} resizeMode="contain"/> 
            </View>

            {/* search bar */}
            <View style={styles.search}>
                <TextInput style={styles.searchinput} placeholder="Search" />
            </View>

            {/* items added to cart */}
            <View style={styles.itemsbox}>
            <FlatList
            data={items}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={{ color: textColor }}>{item.name}</Text>
                <Text style={{ color: textColor }}>{item.price} USD</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}/>
                
            </View>
    </View>

  )
}

export default Cart

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
},

logo: {
    width: 150,
    height: 100,        
    marginBottom: 10,
},

search: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c2b5be',
},

searchinput: {
    color: 'white',
    fontSize: 15,
},

itemsbox: {
  padding: 15,
},

})