import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const Storelocator = () => {

  const { theme } = useTheme()
  const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'

  const [location, setLocation] = useState(null)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    getLocationAndStores()
  }, [])

  async function getLocationAndStores() {
    try {
      // request permission
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        setLoading(false)
        return
      }

      // get current user location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      console.log('user location:', loc.coords)
      setLocation(loc.coords)

      // fetch stores from Supabase
      const { data, error } = await supabase
        .from('Store Location')
        .select('*')

      console.log('stores data:', data)

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
      <View style={[styles.center, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color="#C17C74" />
        <Text style={[styles.loadingtext, { color: textColor }]}>
          Getting your location...
        </Text>
      </View>
    )
  }

  if (errorMsg) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={[styles.errortext, { color: textColor }]}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retrybutton}
          onPress={getLocationAndStores}
        >
          <Text style={styles.retrybuttontext}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          // center map on user location if available
          // otherwise default to Egypt
          latitude: location?.latitude || 30.0444,
          longitude: location?.longitude || 31.2357,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}      
        showsMyLocationButton={true}  
      >

        {/* store markers */}
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: parseFloat(store.latitude),
              longitude: parseFloat(store.longitude),
            }}
            title={store.name}
            description={store.address}
            pinColor="#C17C74"
          />
        ))}

      </MapView>

      {/* info badge */}
      <View style={styles.badge}>
        <Text style={styles.badgetext}>
          📍 {stores.length} stores found
        </Text>
      </View>

      {/* user location info */}
      {location && (
        <View style={styles.locationbadge}>
          <Text style={styles.locationtext}>
            Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

    </View>
  )
}

export default Storelocator

const styles = StyleSheet.create({
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
  },

  loadingtext: {
    fontSize: 16,
    marginTop: 10,
  },

  errortext: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },

  retrybutton: {
    backgroundColor: '#e1d8cf',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  retrybuttontext: {
    fontWeight: 'bold',
    color: '#2C1F1F',
  },

  badge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  badgetext: {
    fontWeight: 'bold',
    color: '#2C1F1F',
  },

  locationbadge: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  locationtext: {
    fontSize: 12,
    color: '#2C1F1F',
  },
  
})