import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {

     // get theme and toggle from context
  const { theme, toggleTheme } = useTheme()

  // colors based on current theme
  const background = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const textColor  = theme === 'dark' ? '#ffffff' : '#2C1F1F'
  const buttonColor = theme === 'dark' ? '#C17C74' : '#e1d8cf'

    return (
        <View style={[styles.container, { backgroundColor: background }]}>

<Text style={[styles.title, { color: textColor }]}>Profile</Text>
            <Text style={styles.info}>Name: John Doe</Text>
            <Text style={styles.info}>Email: johndoe@example.com</Text>
            <Text style={styles.info}>Bio: Software Developer</Text>

             {/* toggle button */}
             <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttontext, { color: textColor }]}>
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Text>
      </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    info: {
      fontSize: 18,
      marginVertical: 5,
    },
    button: {
      marginTop: 20,
      padding: 10,
      borderRadius: 5,
      width: '60%',
      alignItems: 'center',
    },
    buttontext: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  })
  

export default Profile;