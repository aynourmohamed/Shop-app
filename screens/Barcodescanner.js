import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from "../lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const Barcodescanner = ({ navigation }) => {

  const { theme, selectedcurrency } = useTheme()
  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const[scanned,setScanned] = useState(false)
  const [product, setProduct] = useState(null)

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: background }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <View style={styles.permissionContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Ionicons name="camera-outline" size={48} color={mutedText} style={{ marginBottom: 16 }} />
          <Text style={[styles.message, { color: textColor }]}>We need your permission to scan barcodes</Text>
          <TouchableOpacity style={styles.permissionbutton} onPress={requestPermission}>
            <Text style={styles.permissionbuttontext}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  async function handleBarcodeScan({data}) {
    if (scanned) return
    setScanned(true)

    const {data: products, error} = await supabase
    .from('Products')
    .select('*')
    .eq('barcode', data)
    .single()

    if (error || !products) {
        alert('Product not found for this barcode')
        setScanned(false)
    } else {
        setProduct(products)
    }
  }

  async function addtoCart(product) {
    const existing = await AsyncStorage.getItem('cart')
    const cart = existing ? JSON.parse(existing) : []
    const alreadyInCart = cart.find(item => item.id === product.id)
    if (alreadyInCart) {
      const updated = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
      await AsyncStorage.setItem('cart', JSON.stringify(updated))
    } else {
      await AsyncStorage.setItem('cart', JSON.stringify([
        ...cart,
        { id: product.id, name: product.name, price: product.price, category: product.category, imageurl: product.imageurl || null, quantity: 1 }
      ]))
    }
    alert('Added to Cart')
    setScanned(false)
    setProduct(null)
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>

        <CameraView style={styles.camera} facing={facing} onBarcodeScanned={handleBarcodeScan} />

        <SafeAreaView edges={['top']} style={styles.topOverlay}>
          <TouchableOpacity style={styles.closeIconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {!product && (
          <View pointerEvents="none" style={styles.frameOverlay}>
            <View style={styles.frame} />
            <Text style={styles.frameHint}>Align barcode within the frame</Text>
          </View>
        )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse-outline" size={22} color="white" />
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>

      {product && (
      <View style={[styles.productbox, { backgroundColor: cardBg }]}>
        <View style={styles.productTopRow}>
          <View style={[styles.productImageWrap, { backgroundColor: chipBg }]}>
            {product.imageurl ? (
              <Image source={{ uri: product.imageurl }} style={styles.productImage} resizeMode="cover" />
            ) : (
              <Ionicons name="flame-outline" size={24} color="#c2b5be" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.productname, { color: textColor }]}>{product.name}</Text>
            <Text style={styles.productcategory}>{product.category}</Text>
          </View>
        </View>

        <Text style={styles.productprice}>{product.price} {selectedcurrency}</Text>

        <TouchableOpacity style={[styles.againbutton, { backgroundColor: chipBg }]} onPress={() => {
            setScanned(false)
            setProduct(null) }}>
          <Text style={[styles.againtext, { color: textColor }]}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addtocartbutton} onPress={() => addtoCart(product)}>
          <Text style={styles.addtocarttext}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      )}
    </View>
  );
}

export default Barcodescanner

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161512' },
  safearea: { flex: 1 },

  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30,
  },
  closeButton: { position: 'absolute', top: 8, left: 16, padding: 8 },
  message: { textAlign: 'center', paddingBottom: 16, fontSize: 15 },
  permissionbutton: {
    backgroundColor: '#c2b5be', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 20,
  },
  permissionbuttontext: { color: 'white', fontWeight: '700' },

  camera: { flex: 1 },

  topOverlay: { position: 'absolute', top: 0, left: 0, zIndex: 10, elevation: 10 },
  closeIconButton: {
    marginTop: 8, marginLeft: 16, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(44,31,31,0.55)', alignItems: 'center', justifyContent: 'center',
  },

  frameOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 5, elevation: 5,
  },
  frame: {
    width: '75%', height: 140, borderWidth: 2, borderColor: '#c2b5be', borderRadius: 16,
  },
  frameHint: { color: 'white', marginTop: 16, fontSize: 13, fontWeight: '600' },

  buttonContainer: {
    position: 'absolute', bottom: 64, flexDirection: 'row', backgroundColor: 'transparent',
    width: '100%', justifyContent: 'center', zIndex: 10, elevation: 10,
  },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(44,31,31,0.55)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24,
  },
  text: { fontSize: 15, fontWeight: '700', color: 'white' },

  productbox: {
    position: 'absolute', bottom: 0, width: '100%', padding: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },

  productTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  productImageWrap: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },

  productname: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  productcategory: {
    fontSize: 12, color: '#8A7A82', textTransform: 'uppercase', letterSpacing: 0.4,
  },
  productprice: { fontSize: 15, color: '#c2b5be', fontWeight: '700', marginBottom: 16 },

  againbutton: { padding: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  againtext: { fontWeight: '700' },

  addtocartbutton: { backgroundColor: '#c2b5be', padding: 14, borderRadius: 14, alignItems: 'center' },
  addtocarttext: { fontWeight: '700', color: 'white' },
})