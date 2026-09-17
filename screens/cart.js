import {ScrollView, View, Text, TextInput, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useCallback, useState} from 'react';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const productImageMap = {
  'oud': require('../assets/images/oud 3 no bg.png'),
  'aromatherapy': require('../assets/images/aroma 2 no bg.png'),
  'candle making kit': require('../assets/images/Candle kit no bg.png'),
};

function getProductImage(item) {
  const key = Object.keys(productImageMap).find((k) =>
    item.name?.toLowerCase().includes(k)
  );
  return key ? productImageMap[key] : null;
}

const Cart = ({navigation}) => {

  const { theme } = useTheme()

  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'
  const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8'

  const [cart, setCart] = useState([])

  useFocusEffect(
    useCallback(() => {
      loadCart()
    },
  [])
)

  async function loadCart() {
    try{
      const value = await AsyncStorage.getItem('cart')
      if (value !== null) {
        setCart(JSON.parse(value))
      }
    } catch (error) {
      console.log('load error:', error)
    }
  }

    async function removeFromCart(id) {
      try{
        const updatedCart = cart.filter(item => item.id !== id)
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
        setCart(updatedCart)
      } catch (error) {
        console.log('remove error:', error)
      }
  }

  async function increaseQunatity(id){
    const updatedCart = cart.map(item =>
      item.id === id
      ? { ...item, quantity: item.quantity + 1 }
      : item
    )
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  async function decreaseQunatity(id){
    const updatedCart = cart.map(item =>
      item.id === id
      ? { ...item, quantity: item.quantity - 1 }
      : item
    ).filter(item => item.quantity > 0)
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  return(
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

            <View style={styles.logoWrap}>
                <Image source={require('../assets/images/logo no bg.png')}
                style={styles.logoImage} resizeMode="contain"/>
            </View>

            <Text style={[styles.pageTitle, { color: textColor }]}>Your Cart</Text>

            <View style={styles.itemsbox}>
            {cart.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={40} color={mutedText} />
                <Text style={[styles.emptytext, {color: textColor}]}>Your cart is empty</Text>
              </View>
            ) : (
              cart.map((item, index) => {
                const image = getProductImage(item)
                return (
                <View key={item.id || index} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                  <View style={[styles.imageWrap, { backgroundColor: chipBg }]}>
                    {image ? (
                      <Image source={image} style={styles.productImage} resizeMode="contain" />
                    ) : (
                      <Ionicons name="flame-outline" size={26} color="#c2b5be" />
                    )}
                  </View>

                  <View style={styles.cardinfo}>
                    <Text style={[styles.productname, {color: textColor }]}>{item.name}</Text>
                    <Text style={styles.productprice}>{item.price} USD</Text>

                    <View style={styles.qunaityrow}>
                      <TouchableOpacity style={[styles.quantitybutton, { backgroundColor: chipBg }]} onPress={() => decreaseQunatity(item.id)}>
                        <Text style={[styles.quantitybuttontext, { color: textColor }]}>−</Text>
                      </TouchableOpacity>

                      <Text style={[styles.quantitytext, { color: textColor }]}>{item.quantity}</Text>

                      <TouchableOpacity style={[styles.quantitybutton, { backgroundColor: chipBg }]} onPress={() => increaseQunatity(item.id)}>
                        <Text style={[styles.quantitybuttontext, { color: textColor }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.removebutton} onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#B5504A" />
                  </TouchableOpacity>
                </View>
              )})
            )}

        {cart.length > 0 && (
          <>
            <View style={[styles.totalrow, { borderTopColor: borderColor }]}>
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
    </SafeAreaView>
  )
}

export default Cart

const styles = StyleSheet.create({
  safearea: { flex: 1 },
  screen: { flex: 1 },

  logoWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  logoImage: { width: 130, height: 65 },

  pageTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },

  itemsbox: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '85%',
    height: '85%',
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

  qunaityrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  quantitybutton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantitybuttontext: {
    fontSize: 18,
    fontWeight: 'bold',
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

  checkoutbutton: {
    backgroundColor: '#c2b5be',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  checkoutbuttontext: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
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

})