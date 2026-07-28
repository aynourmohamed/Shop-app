import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput, Alert } from "react-native";
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';


const Wishlist = () => {


    const { theme, isLowBattery} = useTheme()
    const background = theme === 'dark' ? '#161512' : '#f9f7f6'
    const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
    const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

    const [wishlist, setWishlist] = useState([])

    useFocusEffect(
      useCallback(() => {
        if (isLowBattery) {
          console.log('Battery low — skipping sync')
        } else {
          getWishlist()
        }
      }, [])
    )

    // fetch
      async function getWishlist() {
        const {data: {user}} = await supabase.auth.getUser()

        const {data,error} = await supabase
        .from('Wishlist')
        .select('*, Products(*)')
        .eq('userid', user.id)

        console.log('data:', data)
        console.log('error:', error)

        if (error) {
            alert(error.message)
          } else {
            setWishlist(data)
          }
        }


        // add
    async function postWishlist(productID) {
        console.log('postWishlist called with productID:', productID)

        const {data: {user}} = await supabase.auth.getUser()
        console.log('user:', user)

        const { error } = await supabase
        .from('Wishlist')
        .insert({ userid: user.id , productid: productID})
        console.log('insert error:', error)

        if (error) {
            alert(error.message)
          } else {
            alert('added')
          }
        }


    // delete
    async function deleteWishlist(id) {
        const {error} = await supabase
        .from('Wishlist')
        .delete()
        .eq('id', id)

        if (error) {
            alert(error.message)
        } else {
            getWishlist()
        }
    }

    return (
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

            {/* wishlist items */}
            <View style={styles.wishlistbox}>
            {wishlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={40} color={mutedText} />
            <Text style={[styles.emptytext, { color: textColor }]}>
              Your wishlist is empty
            </Text>
          </View>
        ) : (
          wishlist.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productname, { color: textColor }]}>{item.Products?.name}</Text>
              <Text style={styles.productcategory}>{item.Products?.category}</Text>
              <Text style={styles.productprice}>{item.Products?.price} USD</Text>
            </View>

            <TouchableOpacity style={styles.removebutton} onPress={() => deleteWishlist(item.id)}>
              <Ionicons name="trash-outline" size={16} color="#B5504A" />
            </TouchableOpacity>
          </View>
        ))
  )}
      </View>

    </ScrollView>
  )
}


export default Wishlist

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

    wishlistbox: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 14,
      },

      card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EDE3E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
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
        marginTop: 2,
      },

      productcategory: {
        fontSize: 12,
        color: '#8A7A82',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      },

      removebutton: {
        backgroundColor: '#FBEAE9',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
