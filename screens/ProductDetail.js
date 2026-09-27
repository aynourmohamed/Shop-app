import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from '@expo/vector-icons/Ionicons';

const ProductDetail = ({ route, navigation }) => {
  const { id } = route.params || {};

  const { theme, selectedcurrency } = useTheme();
  const background = theme === 'dark' ? '#161512' : '#f9f7f6';
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F';
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF';
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82';
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA';
  const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantityInCart, setQuantityInCart] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistRowId, setWishlistRowId] = useState(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    loadProduct();
    loadCartQuantity();
    loadWishlistStatus();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  async function loadCartQuantity() {
    const existing = await AsyncStorage.getItem('cart');
    const cart = existing ? JSON.parse(existing) : [];
    const item = cart.find(i => i.id === id);
    setQuantityInCart(item ? item.quantity : 0);
  }

  async function loadWishlistStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('Wishlist')
      .select('id')
      .eq('userid', user.id)
      .eq('productid', id)
      .maybeSingle();

    if (!error && data) {
      setIsWishlisted(true);
      setWishlistRowId(data.id);
    }
  }

  async function addToCart() {
    const existing = await AsyncStorage.getItem('cart');
    const cart = existing ? JSON.parse(existing) : [];
    const alreadyInCart = cart.find(item => item.id === product.id);

    let updatedCart;
    if (alreadyInCart) {
      updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        imageurl: product.imageurl || null,
        quantity: 1,
      }];
    }

    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    setQuantityInCart(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async function decreaseFromCart() {
    const existing = await AsyncStorage.getItem('cart');
    const cart = existing ? JSON.parse(existing) : [];
    const updatedCart = cart
      .map(item => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item)
      .filter(item => item.quantity > 0);

    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    setQuantityInCart(prev => Math.max(prev - 1, 0));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function toggleWishlist() {
    if (wishlistRowId) {
      const { error } = await supabase.from('Wishlist').delete().eq('id', wishlistRowId);
      if (!error) {
        setIsWishlisted(false);
        setWishlistRowId(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('Wishlist')
        .insert({ userid: user.id, productid: product.id })
        .select()
        .single();

      if (!error) {
        setIsWishlisted(true);
        setWishlistRowId(data.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c2b5be" />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={mutedText} />
          <Text style={[styles.notfoundtext, { color: textColor }]}>Product not found</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Tabnavigator', { screen: 'Products' })}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton} onPress={toggleWishlist}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? '#B5504A' : '#c2b5be'}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.imageWrap, { backgroundColor: chipBg }]}>
          {product.imageurl ? (
            <Image source={{ uri: product.imageurl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Ionicons name="flame-outline" size={64} color="#c2b5be" />
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={[styles.name, { color: textColor }]}>{product.name}</Text>
          <Text style={styles.price}>{product.price} {selectedcurrency}</Text>

          <Text style={[
            styles.stockbadge,
            {
              color: product.stock === 0 ? '#B5504A' : product.stock < 5 ? '#C2883C' : '#3F8F68',
              backgroundColor: product.stock === 0 ? '#FBEAE9' : product.stock < 5 ? '#FBF0E1' : '#E9F4EE',
            }
          ]}>
            {product.stock === 0 ? 'Out of Stock' : `In Stock: ${product.stock}`}
          </Text>

          {product.stock === 0 ? (
            <View style={[styles.cartbutton, { opacity: 0.4 }]}>
              <Text style={styles.cartbuttontext}>Unavailable</Text>
            </View>
          ) : quantityInCart === 0 ? (
            <TouchableOpacity style={styles.cartbutton} onPress={addToCart}>
              <Ionicons name="cart-outline" size={18} color="white" />
              <Text style={styles.cartbuttontext}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperButton} onPress={decreaseFromCart}>
                <Ionicons name="remove" size={18} color="white" />
              </TouchableOpacity>
              <Text style={styles.stepperText}>{quantityInCart}</Text>
              <TouchableOpacity style={styles.stepperButton} onPress={addToCart}>
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.scanbutton, { backgroundColor: chipBg }]}
            onPress={() => navigation.navigate('Barcodescanner')}
          >
            <Ionicons name="barcode-outline" size={16} color={textColor} />
            <Text style={[styles.scanbuttontext, { color: textColor }]}>Scan to find in-store</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  safearea: { flex: 1 },
  screen: { flex: 1 },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingHorizontal: 30,
  },

  notfoundtext: { fontSize: 16, fontWeight: '600' },
  browseButton: {
    backgroundColor: '#c2b5be', paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 20, marginTop: 6,
  },
  browseButtonText: { color: 'white', fontWeight: '700' },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  wishlistButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  imageWrap: {
    width: '100%', height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  image: { width: '100%', height: '100%' },

  infoSection: { paddingHorizontal: 20, paddingBottom: 40 },

  category: {
    fontSize: 12, color: '#8A7A82', textTransform: 'uppercase',
    letterSpacing: 0.6, marginBottom: 6,
  },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 20, fontWeight: '700', color: '#c2b5be', marginBottom: 12 },

  stockbadge: {
    fontSize: 12, fontWeight: '700', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 20,
  },

  cartbutton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#c2b5be', paddingVertical: 14, borderRadius: 16, marginBottom: 12,
  },
  cartbuttontext: { color: 'white', fontSize: 15, fontWeight: '700' },

  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#c2b5be', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 12,
  },
  stepperButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stepperText: { color: 'white', fontWeight: '700', fontSize: 16 },

  scanbutton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 16,
  },
  scanbuttontext: { fontSize: 13, fontWeight: '700' },
});