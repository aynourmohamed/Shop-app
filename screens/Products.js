import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// matches known products to bundled images until Products table has a real image column
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

  const initialCategory = route.params?.category || null
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  // update filter if navigated here again with a new category param
  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category)
    }
  }, [route.params?.category])

  const visibleProducts = products
    .filter(p => !activeCategory || p.category === activeCategory)
    .filter(p => !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()))

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
    const { data, error } = await supabase
      .from('Products')
      .select('*')

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

      const alreadyInCart = cart.find(item => item.id === product.id)

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
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('Wishlist')
      .insert({ userid: user.id, productid: productID })

    if (error) {
      alert(error.message)
    } else {
      alert('added to wishlist')
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

        {/* logo */}
        <View style={styles.logoWrap}>
          <Image source={require('../assets/images/logo no bg.png')}
            style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={[styles.pageTitle, { color: textColor }]}>Our Products</Text>

        {/* search bar */}
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

        {/* active filter indicator — once, above the grid */}
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

        {/* results count */}
        <Text style={[styles.resultsCount, { color: mutedText }]}>
          {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
        </Text>

        {/* products */}
        <View style={styles.productsbox}>
          {visibleProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={mutedText} />
              <Text style={[styles.emptytext, { color: textColor }]}>
                No products match your search
              </Text>
            </View>
          ) : (
            visibleProducts.map((product) => {
              const image = getProductImage(product)
              return (
                <View key={product.id} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                  <View style={styles.cardTopRow}>
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

                    <TouchableOpacity
                      style={[styles.lovebutton, { backgroundColor: theme === 'dark' ? '#3a2b2b' : '#FBEAE9' }]}
                      onPress={() => postWishlist(product.id)}
                    >
                      <Ionicons name="heart-outline" size={18} color="#c2b5be" />
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
  safearea: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  logoWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },

  logoImage: {
    width: 130,
    height: 65,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchinput: {
    fontSize: 15,
    flex: 1,
  },

  filterRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  productsbox: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },

  emptytext: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },

  productImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '85%',
    height: '85%',
  },

  productname: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },

  productcategory: {
    fontSize: 12,
    color: '#8A7A82',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  productprice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#c2b5be',
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

  buttonrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

  lovebutton: {
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  barcodebutton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  barcodebuttontext: {
    fontSize: 13,
    fontWeight: '700',
  },

})