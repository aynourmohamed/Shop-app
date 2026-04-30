import { View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";

const Welcome = ({navigation}) => {

    return(
            <View style={styles.container}>
                

                {/* logo */}
                <Image source={require('../assets/images/logo no bg.png')}
                style={styles.logo}
                resizeMode="contain"
                />

                {/* title */}
                <Text style={styles.title}>Welcome</Text>

                {/* login button */}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')} >
                    <Text style={styles.buttontext}>Login</Text>
                </TouchableOpacity>

                {/* register button */}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.buttontext}>Register</Text>
                </TouchableOpacity>

            </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 100,
    },

    logo: {
        width: 400,
        height: 300,        
        marginBottom: 50,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
    },

    button: {
        backgroundColor: '#e1d8cf',
        padding: 9,
        alignItems: 'center',
        width: '50%',
        marginTop: 15,
    },

    buttontext: {
        color: 'black',
        fontSize: 20,
    },
  })

export default Welcome;
