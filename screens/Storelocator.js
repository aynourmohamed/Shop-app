import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const StoreLocator = () => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        // Fetch store data from an API or local source
        const fetchStores = async () => {
            // Example API call
            const response = await fetch('https://api.example.com/stores');
            const data = await response.json();
            setStores(data);
        };

        fetchStores();
    }, []);

    const renderStoreItem = ({ item }) => (
        <View style={styles.storeItem}>
            <Text style={styles.storeName}>{item.name}</Text>
            <Text>{item.address}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Store Locator</Text>
            <FlatList
                data={stores}
                renderItem={renderStoreItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    storeItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    storeName: {
        fontSize: 18,
        fontWeight: '600',
    },
});

export default StoreLocator;