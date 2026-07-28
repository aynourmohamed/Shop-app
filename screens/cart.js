import {ScrollView, View, Text, TextInput, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {useCallback, useState} from 'react';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';


const Cart = ({navigation}) => {



  const { theme } = useTheme()

const background = theme === 'dark' ? '#161512' : '#f9f7f6'
const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

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
    <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

            {/* logo */}
            <View style={styles.logoWrap}>
                <Image source={require('../assets/images/logo no bg.png')}
                style={styles.logoImage} resizeMode="contain"/>
            </View>

            {/* search bar */}
            <View style={[styles.search, { backgroundColor: cardBg }]}>
                <Ionicons name="search-outline" size={18} color={mutedText} />
                <TextInput
                  style={[styles.searchinput, { color: textColor }]}
                  placeholder="Search"
                  placeholderTextColor={mutedText}
                />
            </View>

            {/* items added to cart */}
            <View style={styles.itemsbox}>
            {cart.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={40} color={mutedText} />
                <Text style={[styles.emptytext, {color: textColor}]}>Your cart is empty</Text>
              </View>
            ) : (
              cart.map((item, index) => (
                <View key={item.id || index} style={[styles.card, { backgroundColor: cardBg }]}>
                  <View style={styles.cardinfo}>
                    <Text style={[styles.productname, {color: textColor }]}>{item.name}</Text>
                    <Text style={styles.productprice}>{item.price} USD</Text>

                    <View style={styles.qunaityrow}>
                      <TouchableOpacity style={styles.quantitybutton} onPress={() => decreaseQunatity(item.id)}>
                        <Text style={styles.quantitybuttontext}>−</Text>
                      </TouchableOpacity>

                      <Text style={[styles.quantitytext, { color: textColor }]}>{item.quantity}</Text>

                      <TouchableOpacity style={styles.quantitybutton} onPress={() => increaseQunatity(item.id)}>
                        <Text style={styles.quantitybuttontext}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* remove */}
                  <TouchableOpacity style={styles.removebutton} onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#B5504A" />
                  </TouchableOpacity>
                </View>
              ))
            )}


            {/* checkout */}
        {cart.length > 0 && (
          <>
            <View style={[styles.totalrow, { borderTopColor: theme === 'dark' ? '#3a3632' : '#EDE3E8' }]}>
              <Text style={[styles.totallabel, { color: mutedText }]}>Total</Text>
              <Text style={[styles.totaltext, { color: textColor }]}>
                {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} USD
              </Text>
            </View>

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
    flex: 1,
},

logoWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
},

logoImage: {
    width: 140,
    height: 90,
},

search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
},

searchinput: {
    fontSize: 15,
    flex: 1,
},

itemsbox: {
  paddingHorizontal: 16,
  paddingBottom: 24,
  gap: 14,
},

quantitybutton: {
  backgroundColor: '#EDE6EA',
  width: 30,
  height: 30,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
},

qunaityrow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},

quantitybuttontext: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2C1F1F',
},

quantitytext: {
  fontSize: 16,
  fontWeight: 'bold',
  marginHorizontal: 16,
},

removebutton: {
  backgroundColor: '#FBEAE9',
  padding: 10,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  width: 40,
},

checkoutbutton: {
  backgroundColor: '#c2b5be',
  padding: 16,
  borderRadius: 14,
  alignItems: 'center',
  marginTop: 4,
},

card: {
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: '#EDE3E8',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 1,
},
cardinfo: {
  flex: 1,
},
productname: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 4,
},
productprice: {
  fontSize: 14,
  color: '#c2b5be',
  fontWeight: '600',
},
emptyState: {
  alignItems: 'center',
  marginTop: 60,
  gap: 10,
},
emptytext: {
  textAlign: 'center',
  fontSize: 16,
},
totalrow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 16,
  marginTop: 4,
  borderTopWidth: 1,
},

totallabel: {
  fontSize: 14,
},

totaltext: {
  fontSize: 20,
  fontWeight: '700',
},

checkoutbuttontext: {
  fontSize: 16,
  fontWeight: '700',
  color: 'white',
},


})
