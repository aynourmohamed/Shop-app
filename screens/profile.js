import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLocales } from 'expo-localization';


  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  ]

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'sp', label: 'Spanish' },
    { code: 'fr', label: 'French' },
  ]

  const Profile = ({navigation}) => {


     // get theme and toggle from context
     const { theme, toggleTheme, selectedcurrency, setSelectedcurrency, selectedlanguage, setSelectedlanguage, t } = useTheme()

     const isDark = theme === 'dark'


  // colors based on current theme
  const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'
  const buttonColor = theme === 'dark' ? '#C17C74' : '#e1d8cf'
  const cardBg      = isDark ? '#2a2a2a' : '#f9f7f6'


  const locales = useLocales()
  const devicecurrency = locales[0]?.currencyCode || 'USD'
  const devicelanguage = locales[0]?.languageTag || 'en'


  async function handleLogout() {
    const {supabase} =await import('../lib/supabase')
    await supabase.auth.signOut()
  }
  
    return (
      <ScrollView style={[styles.screen, { backgroundColor: background }]}>

      {/* logo */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Profile</Text>
      </View>

      {/* device locale info */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectiontitle, { color: textColor }]}>
        {t.devicelocale}
        </Text>
        <Text style={[styles.infotext, { color: textColor }]}>
        {t.language}: {selectedlanguage.toUpperCase()}
        </Text>
        <Text style={[styles.infotext, { color: textColor }]}>
        {t.currency}: {selectedcurrency}
        </Text>
      </View>

      {/* currency selector */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectiontitle, { color: textColor }]}>
        {t.prefcurrency}
        </Text>
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.optionbutton,
              { backgroundColor: selectedcurrency === currency.code
                ? '#C17C74' : buttonColor }
            ]}
            onPress={() => setSelectedcurrency(currency.code)}
          >
            <Text style={[styles.optiontext, { color: textColor }]}>
              {currency.symbol} {currency.label} ({currency.code})
            </Text>
            {selectedcurrency === currency.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* language selector */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectiontitle, { color: textColor }]}>
          {t.preflanguage}
        </Text>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.optionbutton,
              { backgroundColor: selectedlanguage === language.code
                ? '#C17C74' : buttonColor }
            ]}
            onPress={() => setSelectedlanguage(language.code)}
          >
            <Text style={[styles.optiontext, { color: textColor }]}>
              {language.label}
            </Text>
            {selectedlanguage === language.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* dark mode toggle */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectiontitle, { color: textColor }]}>
          Appearance
        </Text>
        <TouchableOpacity
          style={[styles.optionbutton, { backgroundColor: buttonColor }]}
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
        onPress={handleLogout}
      >
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
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    marginTop: 5,
    borderRadius: 12,
    padding: 15,
  },
  sectiontitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infotext: {
    fontSize: 14,
    marginBottom: 6,
  },
  optionbutton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optiontext: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutbutton: {
    backgroundColor: '#ffcccc',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  logouttext: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
  
