import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import MapView, { Marker } from 'react-native-maps'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import Ionicons from '@expo/vector-icons/Ionicons';

const Storelocator = ({ navigation }) => {

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

  const [location, setLocation] = useState(null)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    getLocationAndStores()
  }, [])

  async function getLocationAndStores() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        setLoading(false)
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      setLocation(loc.coords)

      const { data, error } = await supabase
        .from('Store Location')
        .select('*')

      if (error) {
        console.log('stores error:', error)
      } else {
        setStores(data || [])
      }

    } catch (error) {
      setErrorMsg('Could not get location')
      console.log('location error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c2b5be" />
          <Text style={[styles.loadingtext, { color: textColor }]}>
            Getting your location...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (errorMsg) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="location-outline" size={40} color={mutedText} />
          <Text style={[styles.errortext, { color: textColor }]}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retrybutton}
            onPress={getLocationAndStores}
          >
            <Text style={styles.retrybuttontext}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 30.0444,
          longitude: location?.longitude || 31.2357,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: parseFloat(store.latitude),
              longitude: parseFloat(store.longitude),
            }}
            title={store.name}
            description={store.address}
            pinColor="#c2b5be"
          />
        ))}
      </MapView>

      {/* close button — respects safe area, sits over the map */}
      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <TouchableOpacity style={styles.closeIconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={[styles.badge, { backgroundColor: cardBg }]}>
        <Ionicons name="location" size={14} color="#c2b5be" />
        <Text style={[styles.badgetext, { color: textColor }]}>
          {stores.length} stores found
        </Text>
      </View>

      {location && (
        <View style={[styles.locationbadge, { backgroundColor: cardBg }]}>
          <Text style={[styles.locationtext, { color: textColor }]}>
            Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

    </View>
  )
}

export default Storelocator

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },

  closeButton: {
    marginTop: 4,
    marginLeft: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 30,
  },

  loadingtext: {
    fontSize: 16,
    marginTop: 10,
  },

  errortext: {
    fontSize: 16,
    textAlign: 'center',
  },

  retrybutton: {
    backgroundColor: '#c2b5be',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 6,
  },

  retrybuttontext: {
    fontWeight: '700',
    color: 'white',
  },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    elevation: 10,
  },

  closeIconButton: {
    marginTop: 8,
    marginLeft: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(44,31,31,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  badgetext: {
    fontWeight: '700',
  },

  locationbadge: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  locationtext: {
    fontSize: 12,
  },

})