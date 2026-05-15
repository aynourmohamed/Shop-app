import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import {useFocusEffect} from "@react-navigation/native";

const Page_Size = 4

const Orders = () => {


    const { theme, isLowBattery} = useTheme()

    const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
    const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#2a2a2a' : '#f9f7f6'

    const [orders, setOrders] = useState([])
    const [page, setPage] = useState(0)
    const [hasmore, setHasmore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [selectedorder, setSelectedorder] = useState(null)

    useFocusEffect (
      useCallback(() => {
        setOrders([])
        setPage(0)
        setHasmore(true)
        setSelectedorder(null)
        loadOrders(0, true)
      }, [])
    )

    async function loadOrders(pageNumber, reset = false) {
      if (isLowBattery) {
        console.log('Battery low — skipping sync')
        return
      } 
      setLoading(true)

      const {data: {user}} = await supabase.auth.getUser()

      const from = pageNumber * Page_Size
      const to = from + Page_Size - 1

      const {data,error} = await supabase
        .from('Orders')
        .select('*')
        .eq('userid', user.id)
        .order('orderedat', {ascending: false})
        .range(from, to)

        console.log('data:', data)
        console.log('error:', error)

        if (error) {
          alert(error.message)
        } else {
          if (reset) {
            setOrders(data)
          } else {
          setOrders(prev => [...prev, ...data])
          }
          setHasmore(data.length === Page_Size)
        }
          setLoading(false)
    }

    function loadmore(){
      const nextpage= page + 1
      setPage(nextpage)
      loadOrders(nextpage)
    }

    function getItems(order){
      try {
        return JSON.parse(order.items) || []
      } catch {
        return []
      }
    }
    
    if (selectedorder) {
      const items = getItems(selectedorder)
      return (
        <ScrollView style={[styles.screen, { backgroundColor: background }]}>
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => setSelectedorder(null)}
          >
            <Text style={styles.backtext}>← Back to Orders</Text>
          </TouchableOpacity>
  
          <View style={[styles.detailcard, { backgroundColor: cardBg }]}>
            <Text style={[styles.detailtitle, { color: textColor }]}>
              Order #{selectedorder.id.slice(0, 8)}
            </Text>
  
            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: textColor }]}>Status:</Text>
              <Text style={[styles.statusbadge, {
                color: selectedorder.status === 'pending' ? '#e1a800' : '#1D9E75'
              }]}>
                {selectedorder.status}
              </Text>
            </View>
  
            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: textColor }]}>Total:</Text>
              <Text style={[styles.detailvalue, { color: textColor }]}>
                {selectedorder.total} USD
              </Text>
            </View>
  
            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: textColor }]}>Date:</Text>
              <Text style={[styles.detailvalue, { color: textColor }]}>
                {new Date(selectedorder.orderedat).toLocaleDateString()}
              </Text>
            </View>
  
            <Text style={[styles.itemstitle, { color: textColor }]}>Items:</Text>
  
            {items.length === 0 ? (
              <Text style={{ color: textColor }}>No items</Text>
            ) : (
              items.map((item, index) => (
                <View key={index} style={styles.itemrow}>
                  <Text style={[styles.itemname, { color: textColor }]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemprice}>
                    {item.price} USD x {item.quantity}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )
    }

    return (
    <ScrollView style={[styles.screen, { backgroundColor: background }]}>

      <Image
        source={require('../assets/images/logo no bg.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: textColor }]}>My Orders</Text>

      <View style={styles.ordersbox}>
        {orders.length === 0 && !loading ? (
          <Text style={[styles.emptytext, { color: textColor }]}>
            No orders yet
          </Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.card, { backgroundColor: cardBg }]}
              onPress={() => setSelectedorder(order)}
            >
              <View style={styles.cardrow}>
                <Text style={[styles.orderId, { color: textColor }]}>
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text style={[styles.statusbadge, {
                  color: order.status === 'pending' ? '#e1a800' : '#1D9E75'
                }]}>
                  {order.status}
                </Text>
              </View>
              <Text style={styles.total}>{order.total} USD</Text>
              <Text style={styles.date}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.taptext}>Tap to view details →</Text>
            </TouchableOpacity>
          ))
        )}

        {/* loading indicator */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#e1d8cf"
            style={{ marginTop: 20 }}
          />
        )}

        {/* load more button */}
        {hasmore && !loading && orders.length > 0 && (
          <TouchableOpacity
            style={styles.loadmorebutton}
            onPress={loadmore}
          >
            <Text style={styles.loadmoretext}>Load More</Text>
          </TouchableOpacity>
        )}

        {/* no more orders message */}
        {!hasmore && orders.length > 0 && (
          <Text style={[styles.nomoretext, { color: textColor }]}>
            All orders loaded
          </Text>
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
  statusbadge: {
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
    marginBottom: 4,
  },
  taptext: {
    fontSize: 12,
    color: '#c2b5be',
    marginTop: 4,
  },
  loadmorebutton: {
    backgroundColor: '#e1d8cf',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loadmoretext: {
    fontWeight: 'bold',
    color: '#2C1F1F',
  },
  nomoretext: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  backbutton: {
    padding: 15,
    paddingTop: 50,
  },
  backtext: {
    fontSize: 16,
    color: '#c2b5be',
    fontWeight: 'bold',
  },
  detailcard: {
    margin: 15,
    borderRadius: 10,
    padding: 20,
  },
  detailtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detaillabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  detailvalue: {
    fontSize: 15,
  },
  itemstitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  itemrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemname: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemprice: {
    fontSize: 14,
    color: '#c2b5be',
  },
})