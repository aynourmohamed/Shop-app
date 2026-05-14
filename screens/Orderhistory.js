import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import {useFocusEffect} from "@react-navigation/native";

const Orders = ({navigation}) => {


    const { theme, isLowBattery} = useTheme()

    const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'
    const [orders, setOrders] = useState([])

    useEffect(() => {
        if (isLowBattery) {
          console.log('Battery low — skipping sync')
        } else {
          getOrders()
        }
      }, [])

    async function getOrders() {
        const {data: {user}} = await supabase.auth.getUser()

        const {data,error} = await supabase
        .from('Orders')
        .select('*')
        .eq('userid', user.id)
        .order('orderedat', {ascending: false})
        

        console.log('data:', data)
        console.log('error:', error)

        if (error) {
            alert(error.message)
        } else {
            setOrders(data)
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

            <Text style={[styles.title, { color: textColor }]}>My Orders</Text>

      <View style={styles.ordersbox}>
        {orders.length === 0 ? (
          <Text style={[styles.emptytext, { color: textColor }]}>
            No orders yet
          </Text>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardrow}>
                <Text style={[styles.orderId, { color: textColor }]}>
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text style={[styles.status, {
                  color: order.status === 'pending' ? '#e1a800' : '#1D9E75'
                }]}>
                  {order.status}
                </Text>
              </View>
              <Text style={styles.total}>Total: {order.total} USD</Text>
              <Text style={styles.date}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  )
}

export default Orders

const styles = StyleSheet.create({
    screen: {
      flex: 1,
    },
    logo: {
      width: 150,
      height: 100,
      alignSelf: 'center',
      marginTop: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginLeft: 15,
      marginTop: 10,
      marginBottom: 5,
    },
    ordersbox: {
      padding: 15,
    },
    emptytext: {
      textAlign: 'center',
      fontSize: 16,
      marginTop: 50,
    },
    card: {
      backgroundColor: '#f9f7f6',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    cardrow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    orderId: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    status: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    total: {
      fontSize: 14,
      color: '#c2b5be',
      marginBottom: 4,
    },
    date: {
      fontSize: 12,
      color: 'gray',
    },
  })