import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from "../lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import Ionicons from '@expo/vector-icons/Ionicons';


const Barcodescanner = () => {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const[scanned,setScanned] = useState(false)
  const [product, setProduct] = useState(null)

  if (!permission) {
    // camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to scan barcodes</Text>
        <TouchableOpacity style={styles.permissionbutton} onPress={requestPermission}>
          <Text style={styles.permissionbuttontext}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //barcode is scanned
  async function handleBarcodeScan({data}) {
    //stop scanning when scanned once
    if (scanned) return
    setScanned(true)

    console.log('barcode scanned:', data)

    //search in products
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
        { id: product.id, name: product.name, price: product.price, category: product.category, quantity: 1 }
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

        {/* camera */}
        <CameraView style={styles.camera} facing={facing} onBarcodeScanned={handleBarcodeScan} />

        {/* scan frame overlay */}
        {!product && (
          <View pointerEvents="none" style={styles.frameOverlay}>
            <View style={styles.frame} />
            <Text style={styles.frameHint}>Align barcode within the frame</Text>
          </View>
        )}

        {/* flip button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse-outline" size={22} color="white" />
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>

      {/* products */}
      {product && (
      <View style={styles.productbox}>
        <Text style={styles.productname}>{product.name}</Text>
        <Text style={styles.productprice}>{product.price} USD</Text>
        <Text style={styles.productcategory}>{product.category}</Text>

        {/* button to scan again */}
        <TouchableOpacity style={styles.againbutton} onPress={() => {
            setScanned(false)
            setProduct(null) }}>
          <Text style={styles.againtext}>Scan Again</Text>
        </TouchableOpacity>

        {/* add to cart the scanned item */}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#161512',
  },

  message: {
    textAlign: 'center',
    paddingBottom: 16,
    paddingHorizontal: 30,
    color: '#2C1F1F',
    fontSize: 15,
  },

  permissionbutton: {
    backgroundColor: '#c2b5be',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignSelf: 'center',
  },

  permissionbuttontext: {
    color: 'white',
    fontWeight: '700',
  },

  camera: {
    flex: 1,
  },

  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  frame: {
    width: '75%',
    height: 140,
    borderWidth: 2,
    borderColor: '#c2b5be',
    borderRadius: 16,
  },

  frameHint: {
    color: 'white',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(44,31,31,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },

  text: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  productbox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  productname: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1F1F',
    marginBottom: 4,
  },

  productprice: {
    fontSize: 15,
    color: '#c2b5be',
    fontWeight: '700',
    marginBottom: 4,
  },

  productcategory: {
    fontSize: 12,
    color: '#8A7A82',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 16,
  },

  againbutton: {
    backgroundColor: '#EDE6EA',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  againtext: {
    fontWeight: '700',
    color: '#2C1F1F',
  },

  addtocartbutton: {
    backgroundColor: '#c2b5be',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  addtocarttext: {
    fontWeight: '700',
    color: 'white',
  },

})
