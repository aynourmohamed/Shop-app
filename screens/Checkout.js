import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

const Checkout = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');

    const handleCheckout = () => {
        if (!name || !address || !cardNumber) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        Alert.alert('Success', 'Checkout completed!');
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Name:</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />
            <Text>Address:</Text>
            <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />
            <Text>Card Number:</Text>
            <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="Enter your card number"
                keyboardType="numeric"
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />
            <Button title="Checkout" onPress={handleCheckout} />
        </View>
    );
};

export default Checkout;