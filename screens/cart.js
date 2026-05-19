import {ScrollView, View, Text, TextInput, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {useCallback, useState} from 'react';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


const Cart = ({navigation}) => {



  const { theme } = useTheme()

const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

  const [cart, setCart] = useState([])

  useFocusEffect(
    useCallback(() => {
      loadCart()
    },
  [])
)

  // read
  async function loadCart() {
    try{
      const value = await AsyncStorage.getItem('cart')
      if (value !== null) {
        setCart(JSON.parse(value)) //string to array
      }
    } catch (error) {
      console.log('load error:', error)
    }
  }

    // remove
    async function removeFromCart(id) {
      try{ 
        const updatedCart = cart.filter(item => item.id !== id)
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart)) //array to string
        setCart(updatedCart)
      } catch (error) {
        console.log('remove error:', error)
      }
  }

  // increase 
  async function increaseQunatity(id){

    const updatedCart = cart.map(item =>
      item.id === id
      ? { ...item, quantity: item.quantity + 1 }
      : item
    )
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  // decrease 
  async function decreaseQunatity(id){

    const updatedCart = cart.map(item =>
      item.id === id
      ? { ...item, quantity: item.quantity - 1 }
      : item
    ).filter(item => item.quantity > 0) // remove items when quantity hits zero
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(updatedCart)
  }



  return(
    <ScrollView style={[styles.screen, { backgroundColor: background }]}>

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
            {cart.length === 0 ? (
              <Text style={[styles.emptytext, {color: textColor}]}>Your cart is empty</Text>
            ) : (
              cart.map((item, index) => (
                <View key={item.id || index} style={styles.card}>
                  <View style={styles.cardinfo}>
                    <Text style={[styles.productname, {color: textColor }]}>{item.name}</Text>
                    <Text style={styles.productprice}> {item.price} USD</Text>

                    <View style={styles.qunaityrow}>
                      <TouchableOpacity style={styles.quantitybutton} onPress={() => decreaseQunatity(item.id)}>
                        <Text style={styles.quantitybuttontext}>-</Text>
                      </TouchableOpacity>

                      <Text style={[styles.quantitytext, { color: textColor }]}> {item.quantity}</Text>

                      <TouchableOpacity style={styles.quantitybutton} onPress={() => increaseQunatity(item.id)}>
                        <Text style={styles.quantitybuttontext}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* remove */}
                  <TouchableOpacity style={styles.removebutton} onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.removebuttontext}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}


            {/* checkout */}
            {cart.length > 0 && (
  <>
    <Text style={[styles.totaltext, { color: textColor }]}>
      Total: {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} USD
    </Text>

    <TouchableOpacity
      style={styles.checkoutbutton}
      onPress={() => navigation.navigate('Checkout')}
    >
      <Text style={styles.checkoutbuttontext}>Checkout</Text>
    </TouchableOpacity>
  </>
)}
            </View>
                
    </ScrollView>
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

quantitybutton: {
  backgroundColor: '#e1d8cf',
  width: 30,
  height: 30,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
},

qunaityrow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},

quantitybuttontext: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2C1F1F',
},

quantitytext: {
  fontSize: 16,
  fontWeight: 'bold',
  marginHorizontal: 12,
},

removebutton: {
  backgroundColor: '#e1d8cf',
  padding: 8,
  borderRadius: 20,
  alignItems: 'center',
  marginBottom: 20,
},

checkoutbutton: {
  backgroundColor: '#e1d8cf',
  padding: 8,
  borderRadius: 20,
  alignItems: 'center',
},

card: {
  backgroundColor: '#f9f7f6',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
cardinfo: {
  flex: 1,
},
productname: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
},
productprice: {
  fontSize: 14,
  color: '#c2b5be',
},
emptytext: {
  textAlign: 'center',
  fontSize: 16,
  marginTop: 50,
},
removebuttontext: {
  color: 'black',
  fontSize: 13,
  fontWeight: 'bold',
},

checkoutbuttontext: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2C1F1F',
},


})