import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput} from "react-native";
import { supabase } from "../lib/supabase";
import { useState } from "react";


const Register = ({navigation}) => {
    const[firstname, setFirstname]= useState('')
    const[lastname, setLastname]= useState('')
    const[email, setEmail]= useState('')
    const[password, setPassword]= useState('')
    const[confirmpassword, setConfrimpassword]= useState('')

async function Signup() {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })

if (error) {
    alert('Please fill all fields')

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


        {/* firstname */}
        <Text style={styles.fieldname}>First Name</Text>
        <TextInput placeholder='Enter your First name' 
        style={styles.input}
        value={firstname}
        onChangeText={setFirstname}
       />

       {/* lastname */}
       <Text style={styles.fieldname}>Last Name</Text>
        <TextInput placeholder='Enter your Last name' 
        style={styles.input}
        value={lastname}
        onChangeText={setLastname}
       />

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

        {/* confirm password */}
        <Text style={styles.fieldname}>Confirm Password</Text>
        <TextInput placeholder='********' 
        style={styles.input}
        value={confirmpassword}
        onChangeText={setConfrimpassword}
        secureTextEntry={true}
        />

        {/* signup button */}
        <TouchableOpacity style={styles.button} onPress={Signup}>
            <Text style={styles.buttontext}>Signup</Text>
        </TouchableOpacity>

    </View>
  )
}
export default Register

const styles =StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 65,
      },
  
      logo: {
          width: 150,
          height: 100,        
          marginBottom: 10,
          alignSelf: 'center',
      },

      title: {
        fontSize: 20,
        color: 'gray',
        marginBottom: 30,
      },

      fieldname: {
        fontSize: 20,
        color: 'black',
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