import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, TextInput, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import { useNetworkState } from 'expo-network';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    image: require('../assets/images/header.png'),
    title: 'Candles That Care for You',
    subtitle: 'Illuminate and Indulge',
  },
  {
    image: require('../assets/images/second header.png'),
    title: 'Embrace Serenity',
    subtitle: 'Light Your Path',
  },
  {
    image: require('../assets/images/third header.jpg'),
    title: 'Glow Naturally',
    subtitle: 'Your Light, Your Way',
  },
];

const Home = () => {
    const navigation = useNavigation();

    const networkState = useNetworkState();
    const Offline = !networkState.isConnected

    const { theme } = useTheme()

    const background = theme === 'dark' ? '#161512' : '#f9f7f6'
    const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F'
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF'
    const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82'

    // hero carousel state
    const [activeSlide, setActiveSlide] = useState(0)
    const heroScrollRef = useRef(null)

    useEffect(() => {
      const timer = setInterval(() => {
        const next = (activeSlide + 1) % slides.length
        heroScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true })
        setActiveSlide(next)
      }, 4000)
      return () => clearInterval(timer)
    }, [activeSlide])

    function handleHeroScroll(event) {
      const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
      setActiveSlide(slideIndex)
    }

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

            {/* hero carousel */}
            <View style={styles.heroContainer}>
                <ScrollView
                    ref={heroScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleHeroScroll}
                >
                    {slides.map((slide, index) => (
                        <View key={index} style={styles.heroSlide}>
                            <Image source={slide.image} style={styles.heroImage} resizeMode="cover" />
                            <View style={styles.heroOverlay} />
                            <View style={styles.heroTextWrap}>
                                <Text style={styles.heroTitle}>{slide.title}</Text>
                                <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                                <TouchableOpacity
                                    style={styles.heroButton}
                                    onPress={() => navigation.navigate('Products')}
                                >
                                    <Text style={styles.heroButtonText}>Shop Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* dot indicators */}
                <View style={styles.dotsRow}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeSlide && styles.dotActive
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* products */}
            <View style={[styles.products, { backgroundColor: cardBg }]}>
                <Text style={[styles.productstext, { color: textColor }]}>Picks for this Season</Text>

                <View style={styles.card}>
                    <Image source={require('../assets/images/oud 3 no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Oud Scented Candle</Text>
                    <Text style={styles.carddescription}>Rich, woody aroma for a luxurious ambiance.</Text>
                    <TouchableOpacity style={styles.cartbutton} onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/aroma 2 no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Aromatherapy Candle</Text>
                    <Text style={styles.carddescription}>Essential oils for relaxation and well-being.</Text>
                    <TouchableOpacity style={styles.cartbutton} onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.cartbuttontext}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Image source={require('../assets/images/Candle kit no bg.png')}
                        style={styles.productimage} />
                    <Text style={styles.cardtext}>Candle Making Kit</Text>
                    <Text style={styles.carddescription}>Everything you need to craft custom candles.</Text>
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

    heroContainer: {
        width: '100%',
        height: 220,
        marginBottom: 24,
    },

    heroSlide: {
        width: SCREEN_WIDTH,
        height: 220,
    },

    heroImage: {
        width: '100%',
        height: '100%',
    },

    heroOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(44, 31, 31, 0.45)',
    },

    heroTextWrap: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    heroTitle: {
        color: '#f9f7f6',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },

    heroSubtitle: {
        color: '#EDE6EA',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },

    heroButton: {
        backgroundColor: '#c2b5be',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },

    heroButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },

    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },

    dot: {
        width: 20,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#EDE3E8',
    },

    dotActive: {
        backgroundColor: '#c2b5be',
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
        textAlign: 'center',
    },

    carddescription: {
        color: '#8A7A82',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 12,
        paddingHorizontal: 8,
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