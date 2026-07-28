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
                <Text style={styles.title}>Luxe Éclat</Text>
                <Text style={styles.subtitle}>Candles That Care for You</Text>

                {/* login button */}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')} >
                    <Text style={styles.buttontext}>Login</Text>
                </TouchableOpacity>

                {/* register button */}
                <TouchableOpacity style={styles.secondarybutton} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.secondarybuttontext}>Create an Account</Text>
                </TouchableOpacity>

            </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9f7f6',
      paddingHorizontal: 32,
    },

    logo: {
        width: 220,
        height: 160,
        marginBottom: 12,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2C1F1F',
        letterSpacing: 0.5,
    },

    subtitle: {
        fontSize: 14,
        color: '#8A7A82',
        marginTop: 6,
        marginBottom: 48,
    },

    button: {
        backgroundColor: '#c2b5be',
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
        borderRadius: 14,
        marginTop: 8,
    },

    buttontext: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },

    secondarybutton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#c2b5be',
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
        borderRadius: 14,
        marginTop: 14,
    },

    secondarybuttontext: {
        color: '#c2b5be',
        fontSize: 16,
        fontWeight: '700',
    },
  })

export default Welcome;
