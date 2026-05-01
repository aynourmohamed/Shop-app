import { useState } from 'react';
import { Alert, Button, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false)

  const pickImage = async () => {

    // permission 
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    // open photos
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);


    // when user picks an image
    if (!result.canceled) {
      const uri = result.assets[0].uri
      setImage(uri) //show image on screen
      await uploadimage(uri) //uplaod image to supabase
    }
  }

    // upload image to supabase
    const uploadimage = async (uri) => {
      setUploading(true)
    

    const response = await fetch(uri)
    const blob = await response.blob()

    const filename = `product-${Date.now()}.jpg`

    const { data, error } = await supabase
    .storage
    .from('productimage')
    .upload(filename, {
      upsert: false

    })

    if (error) {
      Alert.alert('Upload failed', error.message)
    } else {
      Alert.alert('Success', 'Image uploaded successfully!')
      console.log('uploaded to:', data.path)
    }

    setUploading(false)
  };

  return (
    <View style={styles.container}>
      <Button 
        title={uploading ? 'Uploading...' : 'Pick a product image'} 
        onPress={pickImage} 
      />
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
})