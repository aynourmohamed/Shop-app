import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const Home = () => {

    const [products, setProducts]= useState('')
    
    async function getproducts() {
    const { data, error } = await supabase
    .from('products')
    .select('*')
}
    

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

            {/* header */}
            <View style={styles.header}>
                <Image source={require('../assets/images/header.png')} 
                style={styles.headerimage} resizeMode='cover' />

                {/* dark overlay */}
                 <View style={styles.overlay} />
                <Text style={styles.headertext}>Candles That Care for You – Illuminate and Indulge</Text>
            </View>

            {/* products */}
            <View style={styles.products}>
                <Text style={styles.productstext}>Picks for this Season</Text>
                <View style={styles.card}>
                    <Image source={require('../assets/images/oud 3 no bg.png')} 
                    style={styles.productimage} />
                    <Text style={styles.cardtext}>Oud Scented Candle</Text>
                    <TouchableOpacity style={styles.cartbutton}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/aroma 2 no bg.png')} 
                    style={styles.productimage}/>
                    <Text style={styles.cardtext}>Aromatherapy Candle</Text>
                    <TouchableOpacity style={styles.cartbutton}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/Candle kit no bg.png')} 
                    style={styles.productimage}/>
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
    },

    search: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#c2b5be',
    },

    searchinput: {
        color: 'white',
        fontSize: 15,
    },

    header: {
        width: '100%',
        height: 150,
        marginBottom: 30,
    },

    headerimage: {
        width: '100%',
        height: 150,
        opacity: 0.8,
    },

    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    },

    headertext: {
        color: '#c2b5be',
        position: 'absolute',
        marginTop: 65,
        left: 35,
        fontSize: 16,
    },

    products: {
        backgroundColor: '#f9f7f6',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: 10,
        padding: 10,
    },

    productimage: {
        width: 110,
        height: 110,
    },

    productstext: {
        color: '#c2b5be',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10,
    },

    card: {
        backgroundColor: 'white',
        width: '90%',
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
    },

    cardtext: {
        color: 'black',
        fontSize: 10,
        marginBottom: 10,
    },

    cartbutton: {
        backgroundColor: '#e1d8cf',
        marginBottom: 20,
        textAlign: 'center',
        width: '40%',
        alignItems: 'center',
        height: 25,
        borderRadius: 20,
    },

    cartbuttontext: {
        color: 'black',
        marginTop: 4,
    },
    
    explorebutton: {
        backgroundColor: '#e1d8cf',
        width: '35%',
        alignItems: 'center',
        height: 25,
        borderRadius: 20,
        marginTop: 10,
    },

    explorebuttontext: {
        color: 'black',
        marginTop: 4,
        fontWeight: 'bold',
    },

})