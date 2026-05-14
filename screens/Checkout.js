import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';


const Checkout = ({navigation}) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');

    async function sendorderNotifications() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Order Confirmed',
                body: 'Your order has been placed successfully',
            },
            trigger: null,
        });
    }

    const handleCheckout = async () => {
        if (!name || !address || !cardNumber) {
            Alert.alert('Error', 'Please fill in all fields');
            return
        }

        const {data: {user}} = await supabase.auth.getUser()
        const cartData = await AsyncStorage.getItem('cart')
        const cartItems = cartData ? JSON.parse(cartData) : []

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

        const {error} = await supabase
        .from('Orders')
        .insert({
          userid: user.id,
          items: JSON.stringify(cartItems),
          total: total, 
          status: 'pending',
        })

        if (error) {
          Alert.alert('Error', error.message)
          return
        }

        await AsyncStorage.removeItem('cart')


        await sendorderNotifications();
        Alert.alert('Success', 'Checkout completed!');
    }

    return (
        <View style={styles.container}>
    
          <Text style={styles.title}>Checkout</Text>
    
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
    
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
          />
    
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Enter card number"
            keyboardType="numeric"
            secureTextEntry={true}
          />
    
          <TouchableOpacity style={styles.button} onPress={handleCheckout}>
            <Text style={styles.buttontext}>Place Order</Text>
          </TouchableOpacity>
    
        </View>
      )
    }
    
    export default Checkout
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#2C1F1F',
      },
      label: {
        fontSize: 16,
        color: '#2C1F1F',
        marginBottom: 6,
        marginTop: 10,
      },
      input: {
        borderWidth: 1,
        borderColor: '#c2b5be',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        backgroundColor: '#f9f7f6',
      },
      button: {
        backgroundColor: '#e1d8cf',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
      },
      buttontext: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C1F1F',
      },
    })