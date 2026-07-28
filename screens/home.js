import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import { useNetworkState } from 'expo-network';
import Ionicons from '@expo/vector-icons/Ionicons';

const Home = () => {
    const navigation = useNavigation();

    const networkState = useNetworkState();
    const Offline = !networkState.isConnected

    const { theme } = useTheme()

    const background = theme === 'dark' ? '#161512' : '#f9f7f6'
    const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
    const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'


    return (
        <ScrollView style={[styles.screen, { backgroundColor: background }]} showsVerticalScrollIndicator={false}>

            {/* network banner only shows when offline */}
            {Offline && (
                <View style={styles.offlinebanner}>
                    <Ionicons name="cloud-offline-outline" size={16} color="white" />
                    <Text style={styles.offlinetext}>
                        No Network Connection
                    </Text>
                </View>
            )}

            {/* logo */}
            <View style={styles.logoWrap}>
                <Image source={require('../assets/images/logo no bg.png')}
                    style={styles.logoImage} resizeMode="contain" />
            </View>

            {/* search bar */}
            <View style={[styles.search, { backgroundColor: cardBg }]}>
                <Ionicons name="search-outline" size={18} color={mutedText} />
                <TextInput
                    style={[styles.searchinput, { color: textColor }]}
                    placeholder="Search"
                    placeholderTextColor={mutedText}
                />
            </View>

            {/* header */}
            <View style={styles.header}>
                <Image source={require('../assets/images/header.png')}
                    style={styles.headerimage} resizeMode='cover' />

                {/* dark overlay */}
                <View style={styles.overlay} />
                <Text style={styles.headertext}>Candles That Care for You{'\n'}Illuminate and Indulge</Text>
            </View>

            {/* products */}
            <View style={[styles.products, { backgroundColor: cardBg }]}>
                <Text style={[styles.productstext, { color: textColor }]}>Picks for this Season</Text>

                <View style={styles.card}>
                    <Image source={require('../assets/images/oud 3 no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Oud Scented Candle</Text>
                    <TouchableOpacity style={styles.cartbutton} onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/aroma 2 no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Aromatherapy Candle</Text>
                    <TouchableOpacity style={styles.cartbutton} onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/Candle kit no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Candle Making Kit</Text>
                    <TouchableOpacity style={styles.cartbutton} onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                {/* explore more button */}
                <TouchableOpacity style={styles.explorebutton} onPress={() => navigation.navigate('Products')} >
                    <Text style={styles.explorebuttontext}>Explore More</Text>
                </TouchableOpacity>

                {/* image picker button */}
                <TouchableOpacity style={styles.secondarybutton} onPress={() => navigation.navigate('Imagepicker')} >
                    <Ionicons name="camera-outline" size={16} color="#2C1F1F" />
                    <Text style={styles.secondarybuttontext}>Upload or Take a Photo</Text>
                </TouchableOpacity>

                {/* store locator button */}
                <TouchableOpacity
                    style={styles.secondarybutton}
                    onPress={() => navigation.navigate('Storelocator')}
                >
                    <Ionicons name="location-outline" size={16} color="#2C1F1F" />
                    <Text style={styles.secondarybuttontext}>Find Nearest Store</Text>
                </TouchableOpacity>

                 {/* order history button */}
                 <TouchableOpacity
                    style={styles.secondarybutton}
                    onPress={() => navigation.navigate('Orderhistory')}
                >
                    <Ionicons name="receipt-outline" size={16} color="#2C1F1F" />
                    <Text style={styles.secondarybuttontext}>Order History</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    )
}

export default Home

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    logoWrap: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },

    logoImage: {
        width: 140,
        height: 90,
    },

    search: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    searchinput: {
        fontSize: 15,
        flex: 1,
    },

    header: {
        width: '100%',
        height: 170,
        marginBottom: 24,
        borderRadius: 0,
        overflow: 'hidden',
    },

    headerimage: {
        width: '100%',
        height: 170,
    },

    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(44, 31, 31, 0.45)',
    },

    headertext: {
        color: '#f9f7f6',
        position: 'absolute',
        bottom: 20,
        left: 24,
        right: 24,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 26,
    },

    products: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 16,
        gap: 14,
    },

    productimage: {
        width: 110,
        height: 110,
    },

    productstext: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: 0.3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EDE3E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    cardtext: {
        color: '#2C1F1F',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 12,
    },

    cartbutton: {
        backgroundColor: '#c2b5be',
        alignItems: 'center',
        justifyContent: 'center',
        width: '55%',
        paddingVertical: 8,
        borderRadius: 20,
    },

    cartbuttontext: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },

    explorebutton: {
        backgroundColor: '#c2b5be',
        width: '70%',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 6,
    },

    explorebuttontext: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },

    secondarybutton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EDE6EA',
        width: '85%',
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 4,
    },

    secondarybuttontext: {
        color: '#2C1F1F',
        fontWeight: '700',
        fontSize: 14,
    },

    offlinebanner: {
        backgroundColor: '#B5504A',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
    },

    offlinetext: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },

})
