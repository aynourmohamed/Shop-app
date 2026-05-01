import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput} from "react-native";
import { supabase } from "../lib/supabase";
import { useState } from "react";

const Login = ({navigation}) => {
    const [email, setEmail]= useState('')
    const [password, setPassword]= useState('')
    const [loading, setLoading] = useState(false)

async function Signin() {
  setLoading(true)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  if (error) {
    alert(error.message)
    setLoading(false)

  } else {
    navigation.navigate('Tabnavigator')
  }
}

return (
    <View style={styles.container}>

        {/* logo */}
        <Image source={require('../assets/images/logo no bg.png')}
        style={styles.logo}
        resizeMode="contain"
        />

        {/* title */}
        <Text style={styles.title}>Welcome to Luxe Éclat</Text>

        {/* email */}
        <Text style={styles.fieldname}>Email</Text>
        <TextInput placeholder='Enter your email' 
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        />

        {/* password */}
        <Text style={styles.fieldname}>Password</Text>
        <TextInput placeholder='********' 
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        />

        {/* login button */}
        <TouchableOpacity style={styles.button} onPress={Signin}>
            <Text style={styles.buttontext}>Login</Text>
        </TouchableOpacity>

    </View>
  )
}

export default Login

const styles= StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 65,
      },
  
      logo: {
          width: 150,
          height: 100,        
          marginBottom: 30,
          alignSelf: 'center',
      },

      title: {
        fontSize: 20,
        color: 'gray',
        marginBottom: 40,
      },

      fieldname: {
        fontSize: 20,
        color: 'black',
        marginBottom: 6,
      },

      input: {
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'gray',
        width: '80%',
        padding: 12,
        fontSize: 15,
        marginBottom: 15,
      },

      button: {
        backgroundColor: '#e1d8cf',
        alignItems: 'center',
        width: '85%',      
        padding: 15,       
        borderRadius: 10,  
        marginTop: 20,
      },

      buttontext: {
        color: 'black',
        fontSize: 15,
      },
})