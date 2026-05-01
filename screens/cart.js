import React, { useState } from "react";
import { View, Text, Button, FlatList } from "react-native";

const CartScreen = () => {
  const [items, setItems] = useState(cart.items);

  const refresh = () => {
    setItems([...cart.items]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Cart</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>{item.name} - ${item.price}</Text>
        )}
      />

      <Button
        title="Clear Cart"
        onPress={() => {
          cart.clearCart();
          refresh();
        }}
      />
    </View>
  );
};

export default CartScreen;