import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy';
import { useNetworkState } from 'expo-network';
import Ionicons from '@expo/vector-icons/Ionicons';

const CACHE_PATH = FileSystem.documentDirectory + 'products_cache.json';

const productImageMap = {
  'oud': require('../assets/images/oud 3 no bg.png'),
  'aromatherapy': require('../assets/images/aroma 2 no bg.png'),
  'candle making kit': require('../assets/images/Candle kit no bg.png'),
};

function getProductImage(product) {
  const key = Object.keys(productImageMap).find((k) =>
    product.name?.toLowerCase().includes(k)
  );
  return key ? productImageMap[key] : null;
}

const Products = ({ navigation, route }) => {

  const { theme, isLowBattery, selectedcurrency } = useTheme()

  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'
  const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8'

  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cartQuantities, setCartQuantities] = useState({})
  const [wishlistMap, setWishlistMap] = useState({})
  const [isFromCache, setIsFromCache] = useState(false)

  const networkState = useNetworkState()
  const isOffline = networkState.isConnected === false

  const initialCategory = route.params?.category || null
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category)
    }
  }, [route.params?.category])

  const visibleProducts = products
    .filter(p => !activeCategory || p.category === activeCategory)
    .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    if (networkState.isConnected === undefined) {
      return
    }

    if (networkState.isConnected === false) {
      loadFromCache()
    } else if (isLowBattery) {
      console.log('Battery low — skipping sync, trying cache instead')
      loadFromCache()
    } else {
      getProducts()
    }
  }, [networkState.isConnected, isLowBattery])

  useFocusEffect(
    useCallback(() => {
      loadCartQuantities()
      loadWishlistStatus()
    }, [])
  )

  useEffect(() => {
    if (isOffline) return

    const subscription = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Products' },
        (payload) => {
          setProducts(prev =>
            prev.map(p => p.id === payload.new.id ? payload.new : p)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [isOffline])

  async function getProducts() {
    const { data, error } = await supabase
      .from('Products')
      .select('*')

    if (error) {
      console.log('fetch error, falling back to cache:', error.message)
      await loadFromCache()
    } else {
      setProducts(data)
      setIsFromCache(false)
      try {
        await FileSystem.writeAsStringAsync(CACHE_PATH, JSON.stringify(data))
      } catch (cacheError) {
        console.log('cache write error:', cacheError)
      }
    }
  }

  async function loadFromCache() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(CACHE_PATH)
      if (!fileInfo.exists) {
        console.log('no cache file available yet')
        return
      }
      const cached = await FileSystem.readAsStringAsync(CACHE_PATH)
      setProducts(JSON.parse(cached))
      setIsFromCache(true)
    } catch (error) {
      console.log('cache read error:', error)
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

  async function loadWishlistStatus() {
    if (isOffline) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('Wishlist')
      .select('id, productid')
      .eq('userid', user.id)

    if (error) {
      console.log('wishlist load error:', error)
      return
    }

    const map = {}
    data.forEach(row => { map[row.productid] = row.id })
    setWishlistMap(map)
  }

  async function addtoCart(product) {
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

  async function toggleWishlist(productId) {
    if (isOffline) {
      alert('Wishlist requires an internet connection')
      return
    }

    const existingRowId = wishlistMap[productId]

    if (existingRowId) {
      const { error } = await supabase
        .from('Wishlist')
        .delete()
        .eq('id', existingRowId)

      if (error) {
        alert(error.message)
        return
      }

      setWishlistMap(prev => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('Wishlist')
        .insert({ userid: user.id, productid: productId })
        .select()
        .single()

      if (error) {
        alert(error.message)
        return
      }

      setWishlistMap(prev => ({ ...prev, [productId]: data.id }))
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <Image source={require('../assets/images/logo no bg.png')}
            style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={[styles.pageTitle, { color: textColor }]}>Our Products</Text>

        {isFromCache && (
          <View style={[styles.cacheBanner, { backgroundColor: chipBg }]}>
            <Ionicons name="cloud-offline-outline" size={14} color={mutedText} />
            <Text style={[styles.cacheBannerText, { color: mutedText }]}>
              Showing saved products — connect to the internet for the latest catalog
            </Text>
          </View>
        )}

        <View style={[styles.search, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="search-outline" size={18} color={mutedText} />
          <TextInput
            style={[styles.searchinput, { color: textColor }]}
            placeholder="Search products"
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

        {activeCategory && (
          <View style={styles.filterRow}>
            <View style={[styles.filterPill, { backgroundColor: chipBg }]}>
              <Text style={[styles.filterText, { color: textColor }]}>
                {activeCategory}
              </Text>
              <TouchableOpacity onPress={() => setActiveCategory(null)}>
                <Ionicons name="close" size={14} color={mutedText} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[styles.resultsCount, { color: mutedText }]}>
          {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
        </Text>

        <View style={styles.productsbox}>
          {visibleProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={mutedText} />
              <Text style={[styles.emptytext, { color: textColor }]}>
                {isOffline && products.length === 0
                  ? 'No cached products available — connect to the internet'
                  : 'No products match your search'}
              </Text>
            </View>
          ) : (
            visibleProducts.map((product) => {
              const image = getProductImage(product)
              const quantityInCart = cartQuantities[product.id] || 0
              const isWishlisted = Boolean(wishlistMap[product.id])

              return (
                <View key={product.id} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                  <TouchableOpacity
                    style={styles.cardTopRow}
                    onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
                  >
                    <View style={[styles.productImageWrap, { backgroundColor: chipBg }]}>
                      {image ? (
                        <Image source={image} style={styles.productImage} resizeMode="contain" />
                      ) : (
                        <Ionicons name="flame-outline" size={26} color="#c2b5be" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productname, { color: textColor }]}>{product.name}</Text>
                      <Text style={styles.productcategory}>{product.category}</Text>
                      <Text style={styles.productprice}>{product.price} {selectedcurrency}</Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={[
                    styles.stockbadge,
                    {
                      color: product.stock === 0 ? '#B5504A' : product.stock < 5 ? '#C2883C' : '#3F8F68',
                      backgroundColor: product.stock === 0 ? '#FBEAE9' : product.stock < 5 ? '#FBF0E1' : '#E9F4EE',
                    }
                  ]}>
                    {product.stock === 0 ? 'Out of Stock' : `In Stock: ${product.stock}`}
                  </Text>

                  <View style={styles.buttonrow}>

                    {product.stock === 0 ? (
                      <View style={[styles.cartbutton, { opacity: 0.4 }]}>
                        <Text style={styles.cartbuttontext}>Unavailable</Text>
                      </View>
                    ) : quantityInCart === 0 ? (
                      <TouchableOpacity
                        style={styles.cartbutton}
                        onPress={() => addtoCart(product)}
                      >
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() => decreaseFromCart(product.id)}
                        >
                          <Ionicons name="remove" size={16} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.stepperText}>{quantityInCart}</Text>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() => addtoCart(product)}
                        >
                          <Ionicons name="add" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.lovebutton,
                        { backgroundColor: theme === 'dark' ? '#3a2b2b' : '#FBEAE9' }
                      ]}
                      onPress={() => toggleWishlist(product.id)}
                    >
                      <Ionicons
                        name={isWishlisted ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isWishlisted ? '#B5504A' : '#c2b5be'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.barcodebutton, { backgroundColor: chipBg }]}
                      onPress={() => navigation.navigate('Barcodescanner')}
                    >
                      <Ionicons name="barcode-outline" size={16} color={textColor} />
                      <Text style={[styles.barcodebuttontext, { color: textColor }]}>Scan</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              )
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Products

const styles = StyleSheet.create({
  safearea: { flex: 1 },
  screen: { flex: 1 },

  logoWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  logoImage: { width: 130, height: 65 },

  pageTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },

  cacheBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
  },
  cacheBannerText: {
    fontSize: 12,
    flex: 1,
  },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 12, borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  searchinput: { fontSize: 15, flex: 1 },

  filterRow: { paddingHorizontal: 20, marginBottom: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },

  resultsCount: { fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },

  productsbox: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 10, paddingHorizontal: 30 },
  emptytext: { textAlign: 'center', fontSize: 15, fontWeight: '600' },

  card: {
    borderRadius: 16, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },

  cardTopRow: { flexDirection: 'row', gap: 14, marginBottom: 8 },

  productImageWrap: {
    width: 72, height: 72, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  productImage: { width: '85%', height: '85%' },

  productname: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  productcategory: {
    fontSize: 12, color: '#8A7A82', textTransform: 'uppercase',
    letterSpacing: 0.4, marginBottom: 4,
  },
  productprice: { fontSize: 15, fontWeight: '700', color: '#c2b5be' },

  stockbadge: {
    fontSize: 12, fontWeight: '700', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },

  buttonrow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  cartbutton: {
    backgroundColor: '#c2b5be', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 20, alignItems: 'center', flex: 1,
  },
  cartbuttontext: { color: 'white', fontSize: 13, fontWeight: '700' },

  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#c2b5be', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6,
    flex: 1,
  },
  stepperButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepperText: { color: 'white', fontWeight: '700', fontSize: 14 },

  lovebutton: { padding: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  barcodebutton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20,
  },
  barcodebuttontext: { fontSize: 13, fontWeight: '700' },
})