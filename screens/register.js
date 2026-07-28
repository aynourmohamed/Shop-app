import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { useState } from "react";


const Register = ({navigation}) => {
    const[firstname, setFirstname]= useState('')
    const[lastname, setLastname]= useState('')
    const[email, setEmail]= useState('')
    const[password, setPassword]= useState('')
    const[confirmpassword, setConfrimpassword]= useState('')

async function Signup() {
  if (password !== confirmpassword) {
    alert('Passwords do not match')
    return
  }
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { first_name: firstname, last_name: lastname }

      }
  })

if (error) {
    alert('Please fill all fields')

  } else {
    navigation.navigate('Tabnavigator')
  }
}

  return (
    <ScrollView contentContainerStyle={styles.container}>

        {/* logo */}
        <Image source={require('../assets/images/logo no bg.png')}
        style={styles.logo}
        resizeMode="contain"
        />

        {/* title */}
        <Text style={styles.title}>Welcome to Luxe Éclat</Text>


        {/* firstname */}
        <Text style={styles.fieldname}>First Name</Text>
        <TextInput placeholder='Enter your First name'
        placeholderTextColor="#B3A0A8"
        style={styles.input}
        value={firstname}
        onChangeText={setFirstname}
       />

       {/* lastname */}
       <Text style={styles.fieldname}>Last Name</Text>
        <TextInput placeholder='Enter your Last name'
        placeholderTextColor="#B3A0A8"
        style={styles.input}
        value={lastname}
        onChangeText={setLastname}
       />

       {/* email */}
       <Text style={styles.fieldname}>Email</Text>
        <TextInput placeholder='Enter your email'
        placeholderTextColor="#B3A0A8"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        />

        {/* password */}
        <Text style={styles.fieldname}>Password</Text>
        <TextInput placeholder='********'
        placeholderTextColor="#B3A0A8"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        />

        {/* confirm password */}
        <Text style={styles.fieldname}>Confirm Password</Text>
        <TextInput placeholder='********'
        placeholderTextColor="#B3A0A8"
        style={styles.input}
        value={confirmpassword}
        onChangeText={setConfrimpassword}
        secureTextEntry={true}
        />

        {/* signup button */}
        <TouchableOpacity style={styles.button} onPress={Signup}>
            <Text style={styles.buttontext}>Sign Up</Text>
        </TouchableOpacity>

    </ScrollView>
  )
}
export default Register

const styles =StyleSheet.create({

    container: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 60,
        backgroundColor: '#f9f7f6',
        paddingHorizontal: 24,
      },

      logo: {
          width: 130,
          height: 85,
          marginBottom: 16,
          alignSelf: 'center',
      },

      title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2C1F1F',
        marginBottom: 28,
      },

      fieldname: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C1F1F',
        marginBottom: 8,
        alignSelf: 'flex-start',
      },

      input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDE3E8',
        width: '100%',
        padding: 14,
        fontSize: 15,
        color: '#2C1F1F',
        marginBottom: 16,
      },

      button: {
        backgroundColor: '#c2b5be',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 12,
      },

      buttontext: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
      },

})
