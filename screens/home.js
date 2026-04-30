import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";

const Home = () => {

    return (
        <ScrollView style={styles.screen}>

            {/* logo */}
            <View style={styles.logo}>
                <Image source={require('../assets/images/logo no bg.png')}
                style={styles.logo} resizeMode="contain"/> 
            </View>

            {/* search bar */}
            <View style={styles.search}>
                <TextInput style={styles.searchinput} placeholder="Search" />
            </View>

            {/* header image */}
            <Image source={require('../assets/images/header.png')} 
            style={styles.headerimage}
            resizeMode='cover' />
 

            {/* products */}
            <View style={styles.products}>
                <Text style={styles.productstext}>Picks for this Season</Text>
                <View style={styles.card}>
                    <Image source={require('../assets/images/oud 3 no bg.png')} />
                    <Text style={styles.cardtext}>Oud Scented Candle</Text>
                    <TouchableOpacity style={styles.cartbutton}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/aroma 2 no bg.png')} />
                    <Text style={styles.cardtext}>Aromatherapy Candle</Text>
                    <TouchableOpacity style={styles.cartbutton}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/Candle kit no bg.png')} />
                    <Text style={styles.cardtext}>Candle Making Kit</Text>
                    <TouchableOpacity style={styles.cartbutton}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                {/* explore more button */}
                <TouchableOpacity style={styles.explorebutton}>
                    <Text style={styles.explorebuttontext}>Explore More</Text>
                </TouchableOpacity>    
       

            </View>
        </ScrollView>
    )
}

export default Home

const styles= StyleSheet.create({
    screen: {
        backgroundColor: 'white',
        flex: 1,
    },

    logo: {
        width: 150,
        height: 100,        
        marginBottom: 10,
        alignItems: 'center',
    },

    search: {
        backgroundColor: 'gray',
    },

    searchinput: {
        color: 'white',
        fontSize: 5,
    },

    headerimage: {
        width: '100%',
        height: 100,
    },

    products: {
        backgroundColor: '#f9f7f6',
        textAlign: 'center',
    },

    productstext: {
        color: '#c2b5be',
        fontFamily: 'fantasy',
        fontSize: 15,
    },

    card: {
        backgroundColor: 'white',
    },

    cardtext: {
        color: 'black',
        fontSize: 10,
    },

    cartbutton: {
        backgroundColor: '#c2b5be',
    },

    cartbuttontext: {
        color: 'white',
    },
    
    explorebutton: {
        backgroundColor: '#c2b5be',
    },

    explorebuttontext: {
        color: 'white',
    },

})