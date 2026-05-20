import { useState } from 'react';
import { Alert, Image, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

export default function Imagepicker() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

  // pick from gallery
  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  }

  // take photo with camera
  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  }

  // decode base64 to Uint8Array for Supabase
  function decode(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // upload to Supabase Storage using base64
  async function uploadImage(uri) {
    setUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const filename = `product-${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('productimage')
        .upload(filename, decode(base64), {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        Alert.alert('Upload failed', error.message)
      } else {
        const { data: urlData } = supabase.storage
          .from('productimage')
          .getPublicUrl(filename)
        
        console.log('public URL:', urlData.publicUrl)
        Alert.alert('Success', 'Image uploaded successfully!')
      }
    } catch (e) {
      Alert.alert('Error', e.message);
      console.log('upload error:', e);
    } finally {
      setUploading(false);
    }
  }




  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: textColor }]}>Product Image Upload</Text>

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickFromGallery}
        disabled={uploading}
      >
        <Text style={styles.buttontext}>
          {uploading ? 'Uploading...' : '🖼️ Pick from Gallery'}
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickFromCamera}
        disabled={uploading}
      >
        <Text style={styles.buttontext}>
          {uploading ? 'Uploading...' : '📷 Take a Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 24,
    borderRadius: 12,
  },
  
  button: {
    backgroundColor: '#e1d8cf',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    marginBottom: 12,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttontext: {
    color: '#2C1F1F',
    fontSize: 15,
    fontWeight: 'bold',
  },


});