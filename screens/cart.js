import {ScrollView, View, Text, TextInput, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {useEffect, useState} from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';


const Cart = ({navigation}) => {

  const { theme } = useTheme()

const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

  const [cart, setCart] = useState([])

  useEffect(() => {
    getCart()
  }, [])


  // fetch
  async function getCart() {
    const {data,error} = await supabase
    .from('Cart')
    .select('*')

    console.log('data:', data)
    console.log('error:', error)

    if (error) {
        alert(error.message)
      } else {
        setCart(data)
      }
    }


    // delete
    async function deleteCart(id) {
      const {error} = await supabase
      .from('Cart')
      .delete()
      .eq('id', id)

      if (error) {
          alert(error.message)
      } else {
          getCart()
      }
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
              cart.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardinfo}>
                    <Text style={[styles.productname, {color: textColor }]}>{item.productid}</Text>
                    <Text style={styles.productprice}>Qty: {item.quantity || 1}</Text>
                </View>


            {/* remove */}
            <TouchableOpacity
            style={styles.removebutton} onPress={() => deleteCart(item.id)}>
              <Text style={styles.removebuttontext}>Remove</Text>
            </TouchableOpacity>

            </View>
              ))
            )}

            {/* checkout */}
            {cart.length > 0 && (
            <TouchableOpacity
            style={styles.checkoutbutton} onPress={() => navigation.navigate('Checkout')} >
              <Text style={styles.checkoutbuttontext}>Checkout</Text>
            </TouchableOpacity>
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