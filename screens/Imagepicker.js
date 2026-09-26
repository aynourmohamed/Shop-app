import { useState } from 'react';
import { Alert, Image, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Imagepicker({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA'

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

  function decode(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

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
    <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Product Image Upload</Text>
        <Text style={[styles.subtitle, { color: mutedText }]}>Add a photo from your gallery or camera</Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { borderColor: mutedText }]}>
            <Ionicons name="image-outline" size={40} color={mutedText} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={pickFromGallery}
          disabled={uploading}
        >
          <Ionicons name="images-outline" size={18} color="white" />
          <Text style={styles.buttontext}>
            {uploading ? 'Uploading...' : 'Pick from Gallery'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: chipBg }, uploading && styles.buttonDisabled]}
          onPress={pickFromCamera}
          disabled={uploading}
        >
          <Ionicons name="camera-outline" size={18} color={textColor} />
          <Text style={[styles.secondaryButtontext, { color: textColor }]}>
            {uploading ? 'Uploading...' : 'Take a Photo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 36,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    marginBottom: 28,
    textAlign: 'center',
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 28,
    borderRadius: 16,
  },

  placeholder: {
    width: 220,
    height: 220,
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#c2b5be',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 14,
    width: '85%',
    marginBottom: 12,
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 14,
    width: '85%',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttontext: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButtontext: {
    fontSize: 15,
    fontWeight: '700',
  },

});