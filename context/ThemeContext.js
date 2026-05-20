import {useColorScheme} from 'react-native';
import { createContext, useContext, useState, useEffect} from 'react';
import * as Battery from 'expo-battery';
import { useLocales } from 'expo-localization';


const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    // detect device theme (light/dark)
    const deviceTheme = useColorScheme(); 

    // default theme
    const [theme, setTheme] = useState(deviceTheme || 'light'); 
    
    // toggle to choose light or dark mode
    const toggleTheme = () => {
        setTheme (theme === 'dark' ? 'light' : 'dark');
    }

    const [batteryLevel, setBatteryLevel] = useState(1)

    const [isLowBattery, setIsLowBattery] = useState(false)
    console.log('Battery level:', batteryLevel);

    useEffect(() => {
      Battery.getBatteryLevelAsync().then(level => {
        setBatteryLevel(level)
        setIsLowBattery(level < 0.2)
    })
    

    const subscription = Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
      console.log('Battery level changed:', Math.round(level * 100) + '%')
      setBatteryLevel(level)

      if (level < 0.2) {
          setIsLowBattery(true)
          console.log('Battery is low — background sync paused')
      } else {
          setIsLowBattery(false)
          console.log('Battery is ok — sync resumed')
      }
  })

  return () => {
    subscription.remove()
    console.log('Battery listener removed')
}
}, [])
    
    const [selectedcurrency, setSelectedcurrency] = useState('USD')
    const [selectedlanguage, setSelectedlanguage] = useState('en')

    const translations ={
      en: {
        home:         'Home',
      products:     'Products',
      cart:         'Cart',
      wishlist:     'Wishlist',
      profile:      'Profile',
      addtocart:    'Add to Cart',
      scanbarcode:  'Scan Barcode',
      search:       'Search',
      logout:       'Logout',
      appearance:   'Appearance',
      lightmode:    '☀️ Switch to Light Mode',
      darkmode:     '🌙 Switch to Dark Mode',
      devicelocale: 'Device Locale',
      language:     'Language',
      currency:     'Currency',
      prefcurrency: 'Preferred Currency',
      preflanguage: 'Preferred Language',
      },

      fr: {
        home:         'Accueil',
        products:     'Produits',
        cart:         'Panier',
        wishlist:     'Favoris',
        profile:      'Profil',
        addtocart:    'Ajouter au panier',
        scanbarcode:  'Scanner le code',
        search:       'Rechercher',
        logout:       'Déconnexion',
        appearance:   'Apparence',
        lightmode:    '☀️ Passer en mode clair',
        darkmode:     '🌙 Passer en mode sombre',
        devicelocale: 'Langue de l\'appareil',
        language:     'Langue',
        currency:     'Devise',
        prefcurrency: 'Devise préférée',
        preflanguage: 'Langue préférée',
      },
    }

    const langcode= selectedlanguage.split('-')[0]
    const t = translations[langcode] || translations['en']



return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme,
        isLowBattery,
        batteryLevel,
        selectedcurrency,
        setSelectedcurrency,
        selectedlanguage,
        setSelectedlanguage,
        t,
      }}>
      {children}
      
      
    </ThemeContext.Provider>
    

    
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}