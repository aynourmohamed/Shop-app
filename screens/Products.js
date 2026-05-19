import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy'
import { useNetworkState } from 'expo-network'


const Products = ({navigation}) => {

    const { theme, isLowBattery, selectedcurrency} = useTheme()

    const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'
    const [products, setProducts] = useState([])

    useEffect(() => {
        if (isLowBattery) {
          console.log('Battery low — skipping sync')
        } else {
          getProducts()
        }
      }, [])

      // realtime stock subscription
      useEffect(() => {
        const subscription = supabase
          .channel('products-realtime')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'Products',
            },
            (payload) => {
              console.log('stock updated:', payload.new)
              setProducts(prev =>
                prev.map(p =>
                  p.id === payload.new.id ? payload.new : p
                )
              )
            }
          )
          .subscribe((status) => {
            console.log('🔴 Realtime status:', status) // ← ADD THIS
          })
      
        return () => {
          supabase.removeChannel(subscription)
        }
      }, [])
      
      const networkState = useNetworkState()
      const CACHE_PATH = FileSystem.documentDirectory + 'products_cache.json'
      
      async function getProducts() {
        const isConnected = networkState.isConnected
      
        if (!isConnected) {
          // load from cache when offline
          try {
            const fileInfo = await FileSystem.getInfoAsync(CACHE_PATH)
            if (fileInfo.exists) {
              const cached = await FileSystem.readAsStringAsync(CACHE_PATH)
              setProducts(JSON.parse(cached))
              console.log('loaded from cache — offline mode')
            } else {
              alert('No cached products available offline')
            }
          } catch (e) {
            console.log('cache read error:', e)
          }
          return
        }
      
        // online — fetch from Supabase
        if (isLowBattery) {
          console.log('Battery low — skipping sync')
          return
        }
      
        const { data, error } = await supabase
          .from('Products')
          .select('*')
      
        console.log('data:', data)
        console.log('error:', error)
      
        if (error) {
          alert(error.message)
        } else {
          setProducts(data)
          // save to cache for offline use
          try {
            await FileSystem.writeAsStringAsync(CACHE_PATH, JSON.stringify(data))
            console.log('products cached for offline use')
          } catch (e) {
            console.log('cache write error:', e)
          }
        }
      }

    // add to cart
    async function addtoCart(product) {
      try{
        const existing = await AsyncStorage.getItem('cart')
        const cart = existing ? JSON.parse(existing) : []

        console.log('existing cart:', cart)       
        console.log('product to add:', product.id)

        const alreadyInCart = cart.find(item => item.id === product.id)
        console.log('already in cart:', alreadyInCart)

        if (alreadyInCart) {
          const updatedCart = cart.map(item =>
            item.id === product.id
            ? {...item, quantity: item.quantity + 1}
            :item
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

      const {data: {user}} = await supabase.auth.getUser()
      console.log('user:', user)

      const { error } = await supabase
      .from('Wishlist')
      .insert({ userid: user.id , productid: productID})
      console.log('insert error:', error)

      if (error) {
          alert(error.message)
        } else {
          alert('added to wishlist')
        }
      }

    return (
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

            {/* products */}
            <View style={styles.productsbox}>
                {products.map((product) => (
                    <View key={product.id} style={styles.card}>
                    <Text style={styles.productname}>{product.name}</Text>
                    <Text style={styles.productprice} >{product.price} {selectedcurrency}</Text>
                    <Text style={styles.productcategory}>{product.category}</Text>
                  
                    {/* buttons row */}
                    <View style={styles.buttonrow}>
                  
                      {/* add to cart */}
                      <TouchableOpacity
                        style={styles.cartbutton}
                        onPress={() => {
                          addtoCart(product)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                      </TouchableOpacity>
                  
                      {/* love button */}
                      <TouchableOpacity
                        style={styles.lovebutton}
                        onPress={() => postWishlist(product.id)}
                      >
                        <Text style={styles.lovebuttontext}>❤️</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.barcodebutton} onPress={() => navigation.navigate('Barcodescanner')}>
                        <Text>Scan Barcode</Text>
                      </TouchableOpacity>
                  
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

    productsbox: {
        padding: 15,
      },

      card: {
        backgroundColor: '#f9f7f6',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
      },

      productname: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 5,
      },

      productprice: {
        fontSize: 14,
        color: '#c2b5be',
        marginBottom: 5,
      },

      productcategory: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 10,
      },

      cartbutton: {
        backgroundColor: '#e1d8cf',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
      },

      cartbuttontext: {
        color: 'black',
        fontSize: 13,
      },

      buttonrow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
      },

      lovebutton: {
        backgroundColor: '#fff0f0',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        width: '20%',
      },

      lovebuttontext: {
        fontSize: 16,
      },

      barcodebutton: {
        backgroundColor: '#e1d8cf',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        width: '40%',
      },

    
})