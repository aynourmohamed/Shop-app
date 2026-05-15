import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '../context/ThemeContext'


const Checkout = ({navigation}) => {

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

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
          <h1 style="color:#C17C74">Luxe Éclat</h1>
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

        Alert.alert('Success', 'Checkout completed!');
    }

    return (
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
  
        <Text style={[styles.title, { color: textColor }]}>Checkout</Text>
  
        {/* delivery details */}
        <Text style={[styles.section, { color: textColor }]}>
          Delivery Details
        </Text>
  
        <Text style={[styles.label, { color: textColor }]}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
        />
  
        <Text style={[styles.label, { color: textColor }]}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your delivery address"
        />
  
        {/* payment details */}
        <Text style={[styles.section, { color: textColor }]}>
          Payment Details
        </Text>
  
        <Text style={styles.securetext}>🔒 Your payment info is secure and never stored</Text>
  
        <Text style={[styles.label, { color: textColor }]}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={16}
        />
  
        <View style={styles.row}>
          <View style={styles.halfwidth}>
            <Text style={[styles.label, { color: textColor }]}>Expiry</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={setExpiry}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
  
          <View style={styles.halfwidth}>
            <Text style={[styles.label, { color: textColor }]}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={setCvv}
              placeholder="123"
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={3}
            />
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
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    section: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    securetext: {
      fontSize: 13,
      color: 'green',
      marginBottom: 10,
    },
    label: {
      fontSize: 15,
      marginBottom: 6,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#c2b5be',
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      backgroundColor: '#f9f7f6',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    halfwidth: {
      flex: 1,
    },
    button: {
      backgroundColor: '#e1d8cf',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 50,
    },
    buttontext: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2C1F1F',
    },
  })