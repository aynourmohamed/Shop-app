import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import {useFocusEffect} from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';

const Page_Size = 4

const Orders = () => {


    const { theme, isLowBattery} = useTheme()

    const background = theme === 'dark' ? '#161512' : '#FFFCFA'
    const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
    const mutedText = theme === 'dark' ? '#B8A79E' : '#8C7A72'

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
        .order('created_at', {ascending: false})
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

    function statusColors(status) {
      if (status === 'pending') return { color: '#C2883C', background: '#FBF0E1' }
      return { color: '#3F8F68', background: '#E9F4EE' }
    }

    if (selectedorder) {
      const items = getItems(selectedorder)
      const sc = statusColors(selectedorder.status)
      return (
        <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => setSelectedorder(null)}
          >
            <Ionicons name="arrow-back" size={18} color="#C17C74" />
            <Text style={styles.backtext}>Back to Orders</Text>
          </TouchableOpacity>

          <View style={[styles.detailcard, { backgroundColor: cardBg }]}>
            <Text style={[styles.detailtitle, { color: textColor }]}>
              Order #{selectedorder.id.slice(0, 8)}
            </Text>

            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: mutedText }]}>Status</Text>
              <Text style={[styles.statusbadge, sc]}>
                {selectedorder.status}
              </Text>
            </View>

            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: mutedText }]}>Total</Text>
              <Text style={[styles.detailvalue, { color: textColor }]}>
                {selectedorder.total} USD
              </Text>
            </View>

            <View style={styles.detailrow}>
              <Text style={[styles.detaillabel, { color: mutedText }]}>Date</Text>
              <Text style={[styles.detailvalue, { color: textColor }]}>
                {new Date(selectedorder.created_at).toLocaleDateString()}
              </Text>
            </View>

            <Text style={[styles.itemstitle, { color: textColor }]}>Items</Text>

            {items.length === 0 ? (
              <Text style={{ color: mutedText }}>No items</Text>
            ) : (
              items.map((item, index) => (
                <View key={index} style={[styles.itemrow, { borderBottomColor: theme === 'dark' ? '#3a3632' : '#F1E7E2' }]}>
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
    <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

      <Image
        source={require('../assets/images/logo no bg.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: textColor }]}>My Orders</Text>

      <View style={styles.ordersbox}>
        {orders.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={mutedText} />
            <Text style={[styles.emptytext, { color: textColor }]}>
              No orders yet
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const sc = statusColors(order.status)
            return (
            <TouchableOpacity
              key={order.id}
              style={[styles.card, { backgroundColor: cardBg }]}
              onPress={() => setSelectedorder(order)}
            >
              <View style={styles.cardrow}>
                <Text style={[styles.orderId, { color: textColor }]}>
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text style={[styles.statusbadge, sc]}>
                  {order.status}
                </Text>
              </View>
              <Text style={styles.total}>{order.total} USD</Text>
              <Text style={[styles.date, { color: mutedText }]}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.taprow}>
                <Text style={styles.taptext}>View details</Text>
                <Ionicons name="chevron-forward" size={14} color="#C17C74" />
              </View>
            </TouchableOpacity>
          )})
        )}

        {/* loading indicator */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#C17C74"
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
          <Text style={[styles.nomoretext, { color: mutedText }]}>
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
    width: 140,
    height: 90,
    alignSelf: 'center',
    marginTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  ordersbox: {
    paddingHorizontal: 16,
    gap: 14,
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

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1E7E2',
  },

  cardrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  orderId: {
    fontSize: 16,
    fontWeight: '700',
  },

  statusbadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },

  total: {
    fontSize: 15,
    color: '#C17C74',
    fontWeight: '700',
    marginBottom: 4,
  },

  date: {
    fontSize: 12,
    marginBottom: 8,
  },

  taprow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  taptext: {
    fontSize: 12,
    color: '#C17C74',
    fontWeight: '600',
  },

  loadmorebutton: {
    backgroundColor: '#F3E6E1',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  loadmoretext: {
    fontWeight: '700',
    color: '#2C1F1F',
  },

  nomoretext: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 20,
  },

  backbutton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 16,
    paddingTop: 50,
  },

  backtext: {
    fontSize: 16,
    color: '#C17C74',
    fontWeight: '700',
  },

  detailcard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1E7E2',
  },

  detailtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },

  detailrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  detaillabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  detailvalue: {
    fontSize: 15,
    fontWeight: '600',
  },

  itemstitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
  },

  itemrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  itemname: {
    fontSize: 14,
    fontWeight: '600',
  },

  itemprice: {
    fontSize: 14,
    color: '#C17C74',
    fontWeight: '600',
  },


})