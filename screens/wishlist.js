import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);

    const addToWishlist = (item) => {
        setWishlist((prevWishlist) => [...prevWishlist, item]);
    };

    const removeFromWishlist = (item) => {
        setWishlist((prevWishlist) => prevWishlist.filter(i => i !== item));
    };

    return (
        <View>
            <Text>Your Wishlist</Text>
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item}</Text>
                        <Button title="Remove" onPress={() => removeFromWishlist(item)} />
                    </View>
                )}
            />
            <Button title="Add Item" onPress={() => addToWishlist(`Item ${wishlist.length + 1}`)} />
        </View>
    );
};

export default Wishlist;