import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy'
import { useNetworkState } from 'expo-network'
import Ionicons from '@expo/vector-icons/Ionicons';


const Products = ({ navigation, route }) => {

  const { theme, isLowBattery, selectedcurrency } = useTheme()

  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

  const [products, setProducts] = useState([])

  const initialCategory = route.params?.category || null
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const networkState = useNetworkState()
  const CACHE_PATH = FileSystem.documentDirectory + 'products_cache.json'

  const visibleProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products

  useEffect(() => {
    if (isLowBattery) {
      console.log('Battery low — skipping sync')
    } else {
      getProducts()
    }
  }, [])

  // realtime subscription
  useEffect(() => {
    let subscription

    async function init() {
      if (!isLowBattery) {
        await getProducts()
      }

      subscription = supabase
        .channel('products-realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'Products' },
          (payload) => {
            console.log('Stock updated:', payload.new)

            setProducts(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new : p)
            )
          }
        )
        .subscribe((status) => {
          console.log('Realtime status:', status)
        })
    }

    init()

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [])



  async function getProducts() {
    console.log('getProducts called')

    const { data, error } = await supabase
      .from('Products')
      .select('*')

    console.log('data:', data)
    console.log('error:', error)

    if (error) {
      alert(error.message)
    } else {
      setProducts(data)
    }
  }



  // add to cart
  async function addtoCart(product) {
    try {
      const existing = await AsyncStorage.getItem('cart')
      const cart = existing ? JSON.parse(existing) : []

      console.log('existing cart:', cart)
      console.log('product to add:', product.id)

      const alreadyInCart = cart.find(item => item.id === product.id)
      console.log('already in cart:', alreadyInCart)

      if (alreadyInCart) {
        const updatedCart = cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
        alert('Quantity Updated')
      } else {
        const updatedCart = [...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: 1,
        }]
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart))
        alert('Added to Cart')
      }

    } catch (error) {
      console.log('cart error:', error)
    }
  }


  // add wishlist
  async function postWishlist(productID) {
    console.log('heart clicked, productID:', productID)

    const { data: { user } } = await supabase.auth.getUser()
    console.log('user:', user)

    const { error } = await supabase
      .from('Wishlist')
      .insert({ userid: user.id, productid: productID })
    console.log('insert error:', error)

    if (error) {
      alert(error.message)
    } else {
      alert('added to wishlist')
    }
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

      {/* logo */}
      <View style={styles.logoWrap}>
        <Image source={require('../assets/images/logo no bg.png')}
          style={styles.logoImage} resizeMode="contain" />
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

      {/* products */}
      <View style={styles.productsbox}>
        {visibleProducts.map((product) => (
          <View key={product.id} style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.productname, { color: textColor }]}>{product.name}</Text>
                <Text style={styles.productcategory}>{product.category}</Text>
              </View>
              <Text style={styles.productprice}>{product.price} {selectedcurrency}</Text>
            </View>

            <Text style={[
              styles.stockbadge,
              {
                color: product.stock === 0 ? '#B5504A' : product.stock < 5 ? '#C2883C' : '#3F8F68',
                backgroundColor: product.stock === 0 ? '#FBEAE9' : product.stock < 5 ? '#FBF0E1' : '#E9F4EE',
              }
            ]}>
              {product.stock === 0 ? 'Out of Stock' : `In Stock: ${product.stock}`}
            </Text>

            {/* buttons row */}
            <View style={styles.buttonrow}>

              {/* add to cart */}
              <TouchableOpacity
                style={[styles.cartbutton, product.stock === 0 && { opacity: 0.4 }]}
                disabled={product.stock === 0}
                onPress={() => {
                  addtoCart(product)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }}>
                <Text style={styles.cartbuttontext}>
                  {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>

              {/* love button */}
              <TouchableOpacity
                style={styles.lovebutton}
                onPress={() => postWishlist(product.id)}
              >
                <Ionicons name="heart-outline" size={18} color="#c2b5be" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.barcodebutton} onPress={() => navigation.navigate('Barcodescanner')}>
                <Ionicons name="barcode-outline" size={16} color="#2C1F1F" />
                <Text style={styles.barcodebuttontext}>Scan</Text>
              </TouchableOpacity>

              {/* active filter indicator */}
              {activeCategory && (
                <View style={styles.filterRow}>
                  <Text style={[styles.filterText, { color: textColor }]}>
                    Showing: {activeCategory}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveCategory(null)}>
                    <Text style={styles.clearFilterText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  )
}

export default Products

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

  productsbox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE3E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  productname: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  productprice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#c2b5be',
  },

  productcategory: {
    fontSize: 12,
    color: '#8A7A82',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  stockbadge: {
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },

  cartbutton: {
    backgroundColor: '#c2b5be',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
  },

  cartbuttontext: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },

  buttonrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  lovebutton: {
    backgroundColor: '#FBEAE9',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  barcodebutton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE6EA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
  },

  barcodebuttontext: {
    color: '#2C1F1F',
    fontSize: 13,
    fontWeight: '700',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  clearFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c2b5be',
  },

})
