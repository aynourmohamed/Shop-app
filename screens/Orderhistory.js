import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import {useFocusEffect} from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';

const Page_Size = 4

const productImageMap = {
  'oud': require('../assets/images/oud 3 no bg.png'),
  'aromatherapy': require('../assets/images/aroma 2 no bg.png'),
  'candle making kit': require('../assets/images/Candle kit no bg.png'),
};

function getProductImage(item) {
  const key = Object.keys(productImageMap).find((k) =>
    item.name?.toLowerCase().includes(k)
  );
  return key ? productImageMap[key] : null;
}

const Orders = () => {

    const { theme, isLowBattery} = useTheme()

    const background = theme === 'dark' ? '#161512' : '#f9f7f6'
    const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
    const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
    const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'
    const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8'

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
        <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backbutton}
            onPress={() => setSelectedorder(null)}
          >
            <Ionicons name="arrow-back" size={18} color="#c2b5be" />
            <Text style={styles.backtext}>Back to Orders</Text>
          </TouchableOpacity>

          <View style={[styles.detailcard, { backgroundColor: cardBg, borderColor }]}>
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
              items.map((item, index) => {
                const image = getProductImage(item)
                return (
                <View key={index} style={[styles.itemrow, { borderBottomColor: borderColor }]}>
                  <View style={[styles.itemImageWrap, { backgroundColor: chipBg }]}>
                    {image ? (
                      <Image source={image} style={styles.itemImage} resizeMode="contain" />
                    ) : (
                      <Ionicons name="flame-outline" size={20} color="#c2b5be" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemname, { color: textColor }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemprice}>
                      {item.price} USD x {item.quantity}
                    </Text>
                  </View>
                </View>
              )})
            )}
          </View>
        </ScrollView>
        </SafeAreaView>
      )
    }

    return (
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

      <View style={styles.logoWrap}>
        <Image
          source={require('../assets/images/logo no bg.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

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
              style={[styles.card, { backgroundColor: cardBg, borderColor }]}
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
                <Ionicons name="chevron-forward" size={14} color="#c2b5be" />
              </View>
            </TouchableOpacity>
          )})
        )}

        {loading && (
          <ActivityIndicator
            size="large"
            color="#c2b5be"
            style={{ marginTop: 20 }}
          />
        )}

        {hasmore && !loading && orders.length > 0 && (
          <TouchableOpacity
            style={[styles.loadmorebutton, { backgroundColor: chipBg }]}
            onPress={loadmore}
          >
            <Text style={[styles.loadmoretext, { color: textColor }]}>Load More</Text>
          </TouchableOpacity>
        )}

        {!hasmore && orders.length > 0 && (
          <Text style={[styles.nomoretext, { color: mutedText }]}>
            All orders loaded
          </Text>
        )}
      </View>

    </ScrollView>
    </SafeAreaView>
  )
}

export default Orders

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

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  ordersbox: {
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
    fontSize: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    color: '#c2b5be',
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
    color: '#c2b5be',
    fontWeight: '600',
  },

  loadmorebutton: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  loadmoretext: {
    fontWeight: '700',
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
    paddingTop: 12,
  },

  backtext: {
    fontSize: 16,
    color: '#c2b5be',
    fontWeight: '700',
  },

  detailcard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
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
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  itemImageWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  itemImage: {
    width: '80%',
    height: '80%',
  },

  itemname: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  itemprice: {
    fontSize: 14,
    color: '#c2b5be',
    fontWeight: '600',
  },

})