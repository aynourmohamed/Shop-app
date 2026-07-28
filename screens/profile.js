import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLocales } from 'expo-localization';
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


     // get theme and toggle from context
     const { theme, toggleTheme, selectedcurrency, setSelectedcurrency, selectedlanguage, setSelectedlanguage, t } = useTheme()

     const isDark = theme === 'dark'


  // colors based on current theme
  const background = theme === 'dark' ? '#161512' : '#FFFCFA'
  const textColor  = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
  const mutedText = theme === 'dark' ? '#B8A79E' : '#8C7A72'
  const cardBg      = isDark ? '#252220' : '#FFFFFF'


  const locales = useLocales()
  const devicecurrency = locales[0]?.currencyCode || 'USD'
  const devicelanguage = locales[0]?.languageTag || 'en'


  async function handleLogout() {
    const {supabase} =await import('../lib/supabase')
    await supabase.auth.signOut()
  }

    return (
      <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

      {/* logo */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Profile</Text>
      </View>

      {/* device locale info */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe-outline" size={16} color="#C17C74" />
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
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={16} color="#C17C74" />
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
                : { backgroundColor: isDark ? '#2f2a27' : '#F8F1EE' }
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
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={16} color="#C17C74" />
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
                : { backgroundColor: isDark ? '#2f2a27' : '#F8F1EE' }
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
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="contrast-outline" size={16} color="#C17C74" />
          <Text style={[styles.sectiontitle, { color: textColor }]}>
            Appearance
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.optionbutton, { backgroundColor: isDark ? '#2f2a27' : '#F8F1EE' }]}
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
          const { supabase } = await import('../lib/supabase')
          await supabase.auth.signOut()
          navigation.navigate('Welcome')
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#B5504A" />
        <Text style={styles.logouttext}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}


export default Profile;


const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1E7E2',
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
    backgroundColor: '#C17C74',
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