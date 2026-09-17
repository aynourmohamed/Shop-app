import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from '@expo/vector-icons/Ionicons';

const productImageMap = {
  'oud': require('../assets/images/oud 3 no bg.png'),
  'aromatherapy': require('../assets/images/aroma 2 no bg.png'),
  'candle making kit': require('../assets/images/Candle kit no bg.png'),
};

function getProductImage(product) {
  const key = Object.keys(productImageMap).find((k) =>
    product?.name?.toLowerCase().includes(k)
  );
  return key ? productImageMap[key] : null;
}

const Wishlist = () => {

  const { theme, isLowBattery, selectedcurrency } = useTheme()
  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'
  const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8'
  const removeButtonBg = theme === 'dark' ? '#3a2b2b' : '#FBEAE9'

  const [wishlist, setWishlist] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cartQuantities, setCartQuantities] = useState({})

  const visibleWishlist = wishlist.filter(item =>
    !searchQuery || item.Products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useFocusEffect(
    useCallback(() => {
      loadCartQuantities()
      if (isLowBattery) {
        console.log('Battery low — skipping sync')
      } else {
        getWishlist()
      }
    }, [])
  )

  async function getWishlist() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('Wishlist')
      .select('*, Products(*)')
      .eq('userid', user.id)

    if (error) {
      alert(error.message)
    } else {
      setWishlist(data)
    }
  }

  async function deleteWishlist(id) {
    const { error } = await supabase
      .from('Wishlist')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      getWishlist()
    }
  }

  async function loadCartQuantities() {
    try {
      const existing = await AsyncStorage.getItem('cart')
      const cart = existing ? JSON.parse(existing) : []
      const map = {}
      cart.forEach(item => { map[item.id] = item.quantity })
      setCartQuantities(map)
    } catch (error) {
      console.log('cart load error:', error)
    }
  }

  async function addtoCart(product) {
    if (!product) return
    try {
      const existing = await AsyncStorage.getItem('cart')
      const cart = existing ? JSON.parse(existing) : []

      const alreadyInCart = cart.find(item => item.id === product.id)

      let updatedCart
      if (alreadyInCart) {
        updatedCart = cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        updatedCart = [...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: 1,
        }]
      }

      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
      setCartQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (error) {
      console.log('cart error:', error)
    }
  }

  async function decreaseFromCart(productId) {
    try {
      const existing = await AsyncStorage.getItem('cart')
      const cart = existing ? JSON.parse(existing) : []

      const updatedCart = cart
        .map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0)

      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
      setCartQuantities(prev => {
        const next = { ...prev }
        const newQty = (prev[productId] || 0) - 1
        if (newQty <= 0) {
          delete next[productId]
        } else {
          next[productId] = newQty
        }
        return next
      })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log('cart error:', error)
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <Image source={require('../assets/images/logo no bg.png')}
            style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={[styles.pageTitle, { color: textColor }]}>My Wishlist</Text>

        <View style={[styles.search, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="search-outline" size={18} color={mutedText} />
          <TextInput
            style={[styles.searchinput, { color: textColor }]}
            placeholder="Search wishlist"
            placeholderTextColor={mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={mutedText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.wishlistbox}>
          {wishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={40} color={mutedText} />
              <Text style={[styles.emptytext, { color: textColor }]}>Your wishlist is empty</Text>
              <Text style={[styles.emptysubtext, { color: mutedText }]}>
                Tap the heart on any product to save it here
              </Text>
            </View>
          ) : visibleWishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={mutedText} />
              <Text style={[styles.emptytext, { color: textColor }]}>
                No matches for "{searchQuery}"
              </Text>
            </View>
          ) : (
            visibleWishlist.map((item) => {
              const image = getProductImage(item.Products)
              const stock = item.Products?.stock
              const outOfStock = stock === 0
              const productId = item.Products?.id
              const quantityInCart = cartQuantities[productId] || 0

              return (
                <View key={item.id} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.productImageWrap, { backgroundColor: chipBg }]}>
                      {image ? (
                        <Image source={image} style={styles.productImage} resizeMode="contain" />
                      ) : (
                        <Ionicons name="flame-outline" size={26} color="#c2b5be" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productname, { color: textColor }]}>{item.Products?.name}</Text>
                      <Text style={styles.productcategory}>{item.Products?.category}</Text>
                      <Text style={styles.productprice}>{item.Products?.price} {selectedcurrency}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.removebutton, { backgroundColor: removeButtonBg }]}
                      onPress={() => deleteWishlist(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#B5504A" />
                    </TouchableOpacity>
                  </View>

                  {outOfStock && (
                    <Text style={styles.outofstocktext}>Out of Stock</Text>
                  )}

                  {outOfStock ? (
                    <View style={[styles.cartbutton, { opacity: 0.4 }]}>
                      <Text style={styles.cartbuttontext}>Unavailable</Text>
                    </View>
                  ) : quantityInCart === 0 ? (
                    <TouchableOpacity
                      style={styles.cartbutton}
                      onPress={() => addtoCart(item.Products)}
                    >
                      <Ionicons name="cart-outline" size={16} color="white" />
                      <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        onPress={() => decreaseFromCart(productId)}
                      >
                        <Ionicons name="remove" size={16} color="white" />
                      </TouchableOpacity>
                      <Text style={styles.stepperText}>{quantityInCart}</Text>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        onPress={() => addtoCart(item.Products)}
                      >
                        <Ionicons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Wishlist

const styles = StyleSheet.create({
  safearea: { flex: 1 },
  screen: { flex: 1 },

  logoWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  logoImage: { width: 130, height: 65 },

  pageTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 16, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  searchinput: { fontSize: 15, flex: 1 },

  wishlistbox: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },

  card: {
    borderRadius: 16, padding: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },

  productImageWrap: {
    width: 64, height: 64, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  productImage: { width: '85%', height: '85%' },

  productname: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productcategory: {
    fontSize: 12, color: '#8A7A82', textTransform: 'uppercase',
    letterSpacing: 0.4, marginBottom: 2,
  },
  productprice: { fontSize: 14, color: '#c2b5be', fontWeight: '700' },

  removebutton: { padding: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  outofstocktext: { fontSize: 12, fontWeight: '700', color: '#B5504A', marginBottom: 8 },

  cartbutton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#c2b5be', paddingVertical: 10, borderRadius: 20,
  },
  cartbuttontext: { color: 'white', fontSize: 13, fontWeight: '700' },

  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#c2b5be', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6,
  },
  stepperButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepperText: { color: 'white', fontWeight: '700', fontSize: 14 },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 10, paddingHorizontal: 30 },
  emptytext: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
  emptysubtext: { textAlign: 'center', fontSize: 13 },
})