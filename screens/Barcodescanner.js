import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from "../lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage'


const Barcodescanner = () => {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const[scanned,setScanned] = useState(false)
  const [product, setProduct] = useState(null)

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to scan Barcode</Text>
        <Button onPress={requestPermission} title="grant permission" />
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

        {/* flip button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
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
          <Text style={styles.againtext}>Scan Again Please</Text>
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
  },

  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },

  camera: {
    flex: 1,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },

  button: {
    flex: 1,
    alignItems: 'center',
  },

  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  productbox: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
  },

  productname: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },

  productprice: {
    fontSize: 14,
    color: '#c2b5be',
    marginBottom: 5,
  },

  productcategory: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
  },

  againbutton: {
    backgroundColor: '#e1d8cf',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  againtext: {
    fontWeight: 'bold',
  },

  addtocartbutton: {
    backgroundColor: '#e1d8cf',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  addtocarttext: {
    fontWeight: 'bold',
  },
 
})
