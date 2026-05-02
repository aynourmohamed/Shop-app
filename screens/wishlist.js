import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';


const Wishlist = () => {


    const { theme, isLowBattery} = useTheme()
    const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

    const [wishlist, setWishlist] = useState([])

    useEffect(() => {
        if (isLowBattery) {
          console.log('Battery low — skipping sync')
        } else {
          getWishlist()
        }
      }, [])



    // fetch
      async function getWishlist() {
        const {data,error} = await supabase
        .from('Wishlist')
        .select('*')

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

            {/* wishlist items */}
            <View style={styles.wishlistbox}>
            {wishlist.length === 0 ? (
          <Text style={[styles.emptytext, { color: textColor }]}>
            Your wishlist is empty
          </Text>
        ) : (
                wishlist.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.itemname}>{item.name}</Text>
                        <Text style={styles.itemprice}>{item.price} USD</Text>
                        <Text style={styles.itemcategory}>{item.category}</Text>

                       {/* remove button */}
              <TouchableOpacity
                style={styles.removebutton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  deleteWishlist(item.id)
                }}
              >
                <Text style={styles.removebuttontext}>Remove</Text>
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

    wishlistbox: {
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
    
})