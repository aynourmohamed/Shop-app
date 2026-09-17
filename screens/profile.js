import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocales } from 'expo-localization';
import { supabase } from '../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';


  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  ]

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
  ]

  const Profile = ({navigation}) => {

     const { theme, toggleTheme, selectedcurrency, setSelectedcurrency, selectedlanguage, setSelectedlanguage, t } = useTheme()

     const isDark = theme === 'dark'

  const background = theme === 'dark' ? '#161512' : '#f9f7f6'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'
  const cardBg      = isDark ? '#252220' : '#FFFFFF'
  const borderColor = isDark ? '#3a3632' : '#EDE3E8'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadUserInfo()
  }, [])

  async function loadUserInfo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const first = user.user_metadata?.first_name || ''
    const last = user.user_metadata?.last_name || ''
    setFullName(`${first} ${last}`.trim())
    setEmail(user.email || '')
  }

  const initial = fullName ? fullName[0].toUpperCase() : email ? email[0].toUpperCase() : '?'

  const locales = useLocales()
  const devicecurrency = locales[0]?.currencyCode || 'USD'
  const devicelanguage = locales[0]?.languageTag || 'en'

    return (
      <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

      {/* logo */}
      <View style={styles.logoWrap}>
        <Image source={require('../assets/images/logo no bg.png')}
          style={styles.logoImage} resizeMode="contain" />
      </View>

      <Text style={[styles.pageTitle, { color: textColor }]}>Profile</Text>

      {/* identity card */}
      <View style={[styles.identityCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.identityName, { color: textColor }]}>
            {fullName || 'Luxe Éclat Member'}
          </Text>
          <Text style={[styles.identityEmail, { color: mutedText }]}>
            {email}
          </Text>
        </View>
      </View>

      {/* device locale info */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe-outline" size={16} color="#c2b5be" />
          <Text style={[styles.sectiontitle, { color: textColor }]}>
          {t.devicelocale}
          </Text>
        </View>
        <Text style={[styles.infotext, { color: mutedText }]}>
        {t.language}: {selectedlanguage.toUpperCase()}
        </Text>
        <Text style={[styles.infotext, { color: mutedText }]}>
        {t.currency}: {selectedcurrency}
        </Text>
      </View>

      {/* currency selector */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={16} color="#c2b5be" />
          <Text style={[styles.sectiontitle, { color: textColor }]}>
          {t.prefcurrency}
          </Text>
        </View>
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.optionbutton,
              selectedcurrency === currency.code
                ? styles.optionbuttonActive
                : { backgroundColor: isDark ? '#2f2a27' : '#EDE6EA' }
            ]}
            onPress={() => setSelectedcurrency(currency.code)}
          >
            <Text style={[
              styles.optiontext,
              { color: selectedcurrency === currency.code ? 'white' : textColor }
            ]}>
              {currency.symbol} {currency.label} ({currency.code})
            </Text>
            {selectedcurrency === currency.code && (
              <Ionicons name="checkmark" size={18} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* language selector */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={16} color="#c2b5be" />
          <Text style={[styles.sectiontitle, { color: textColor }]}>
            {t.preflanguage}
          </Text>
        </View>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.optionbutton,
              selectedlanguage === language.code
                ? styles.optionbuttonActive
                : { backgroundColor: isDark ? '#2f2a27' : '#EDE6EA' }
            ]}
            onPress={() => setSelectedlanguage(language.code)}
          >
            <Text style={[
              styles.optiontext,
              { color: selectedlanguage === language.code ? 'white' : textColor }
            ]}>
              {language.label}
            </Text>
            {selectedlanguage === language.code && (
              <Ionicons name="checkmark" size={18} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* dark mode toggle */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="contrast-outline" size={16} color="#c2b5be" />
          <Text style={[styles.sectiontitle, { color: textColor }]}>
            Appearance
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.optionbutton, { backgroundColor: isDark ? '#2f2a27' : '#EDE6EA' }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.optiontext, { color: textColor }]}>
            {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* logout */}
      <TouchableOpacity
        style={styles.logoutbutton}
        onPress={async () => {
          await supabase.auth.signOut()
          navigation.navigate('Welcome')
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#B5504A" />
        <Text style={styles.logouttext}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  )
}


export default Profile;


const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  logoWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },

  logoImage: {
    width: 130,
    height: 65,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#c2b5be',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },

  identityName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },

  identityEmail: {
    fontSize: 13,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  sectiontitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  infotext: {
    fontSize: 14,
    marginBottom: 6,
  },

  optionbutton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },

  optionbuttonActive: {
    backgroundColor: '#c2b5be',
  },

  optiontext: {
    fontSize: 14,
    fontWeight: '600',
  },

  logoutbutton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FBEAE9',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    marginBottom: 40,
  },

  logouttext: {
    color: '#B5504A',
    fontSize: 16,
    fontWeight: '700',
  },

})