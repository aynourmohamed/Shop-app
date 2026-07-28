import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '../context/ThemeContext'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons';



const Checkout = ({navigation}) => {

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    async function sendorderNotifications() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Order Confirmed',
                body: 'Your order has been placed successfully',
            },
            trigger: null,
        });
    }

    async function generateAndSavePDF(cartItems, total, orderId) {
      const itemsHTML = cartItems.map(item => `
        <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.price} USD</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.price * item.quantity} USD</td>
        </tr>
      `).join('')

      const html = `
      <html>
        <body style="font-family:Arial;padding:30px;color:#2C1F1F">
          <h1 style="color:#c2b5be">Luxe Éclat</h1>
          <h2>Invoice / Receipt</h2>
          <hr/>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Address:</strong> ${address}</p>
          <hr/>
          <table width="100%" style="border-collapse:collapse">
            <tr style="background:#f9f7f6">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:left">Qty</th>
              <th style="padding:8px;text-align:left">Price</th>
              <th style="padding:8px;text-align:left">Subtotal</th>
            </tr>
            ${itemsHTML}
          </table>
          <hr/>
          <h3>Total: ${total} USD</h3>
          <p style="color:green">✓ Payment received</p>
          <p style="color:gray;font-size:12px">
            Thank you for shopping with Luxe Éclat
          </p>
        </body>
      </html>
    `

    // create PDF file
    const { uri } = await Print.printToFileAsync({ html })

    // share the PDF
    const canShare = await Sharing.isAvailableAsync()
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save your receipt',
      })
    }

    }

    const handleCheckout = async () => {
        if (!name || !address || !cardNumber || !expiry || !cvv) {
            Alert.alert('Error', 'Please fill in all fields');
            return
        }

        if (cardNumber.replace(/\s/g, '').length < 16) {
          Alert.alert('Error', 'Enter a valid card number')
          return
        }

        if (cvv.length < 3) {
          Alert.alert('Error', 'Please enter a valid CVV')
          return
        }

        const {data: {user}} = await supabase.auth.getUser()

        const cartData = await AsyncStorage.getItem('cart')
        const cartItems = cartData ? JSON.parse(cartData) : []

        if (cartItems.length === 0) {
          Alert.alert('Error', 'Your cart is empty')
          return
        }

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

        const {data, error} = await supabase
        .from('Orders')
        .insert({
          userid: user.id,
          items: JSON.stringify(cartItems),
          total: total,
          status: 'pending',
        })
        .select()
        .single()

        if (error) {
          Alert.alert('Error', error.message)
          return
        }

        await AsyncStorage.removeItem('cart')


        await sendorderNotifications();


        await generateAndSavePDF(cartItems, total, data?.id || 'N/A')

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)


        Alert.alert('Success', 'Checkout completed!');
    }

    return (
      <ScrollView style={[styles.container, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: textColor }]}>Checkout</Text>

        {/* delivery details */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color="#c2b5be" />
            <Text style={[styles.section, { color: textColor }]}>Delivery Details</Text>
          </View>

          <Text style={[styles.label, { color: mutedText }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor="#B3A0A8"
          />

          <Text style={[styles.label, { color: mutedText }]}>Address</Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your delivery address"
            placeholderTextColor="#B3A0A8"
          />
        </View>

        {/* payment details */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={18} color="#c2b5be" />
            <Text style={[styles.section, { color: textColor }]}>Payment Details</Text>
          </View>

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed-outline" size={13} color="#3F8F68" />
            <Text style={styles.securetext}>Your payment info is secure and never stored</Text>
          </View>

          <Text style={[styles.label, { color: mutedText }]}>Card Number</Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#B3A0A8"
            keyboardType="numeric"
            maxLength={16}
          />

          <View style={styles.row}>
            <View style={styles.halfwidth}>
              <Text style={[styles.label, { color: mutedText }]}>Expiry</Text>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                placeholderTextColor="#B3A0A8"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.halfwidth}>
              <Text style={[styles.label, { color: mutedText }]}>CVV</Text>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor="#B3A0A8"
                keyboardType="numeric"
                secureTextEntry={true}
                maxLength={3}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <Text style={styles.buttontext}>Place Order & Get Receipt</Text>
        </TouchableOpacity>

      </ScrollView>
    )
  }

  export default Checkout

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
    },

    title: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 20,
    },

    sectionCard: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EDE3E8',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },

    section: {
      fontSize: 16,
      fontWeight: '700',
    },

    secureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },

    securetext: {
      fontSize: 12,
      color: '#3F8F68',
      fontWeight: '600',
    },

    label: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 6,
    },

    input: {
      borderWidth: 1,
      borderColor: '#EDE3E8',
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      backgroundColor: 'transparent',
      marginBottom: 4,
    },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },

    halfwidth: {
      flex: 1,
    },

    button: {
      backgroundColor: '#c2b5be',
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 50,
    },

    buttontext: {
      fontSize: 16,
      fontWeight: '700',
      color: 'white',
    },


  })
