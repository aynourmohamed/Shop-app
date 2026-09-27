import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from '../context/ThemeContext';
import { useNetworkState } from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HERO_HEIGHT = SCREEN_WIDTH * 0.62;
const PICK_CARD_WIDTH = SCREEN_WIDTH * 0.42;

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

// picks one product per category first, then fills remaining slots
// so Home doesn't just show the first 3 rows of the same category
function pickFeatured(products, maxCount) {
    const byCategory = {};
    products.forEach((product) => {
        const key = product.category || 'uncategorized';
        if (!byCategory[key]) byCategory[key] = product;
    });

    const oneEach = Object.values(byCategory);
    if (oneEach.length >= maxCount) return oneEach.slice(0, maxCount);

    const remaining = products.filter((p) => !oneEach.includes(p));
    return [...oneEach, ...remaining].slice(0, maxCount);
}

const Home = () => {
    const navigation = useNavigation();

    const networkState = useNetworkState();
    const Offline = !networkState.isConnected;

    const { theme, selectedcurrency, isLowBattery } = useTheme();

    const background = theme === 'dark' ? '#161512' : '#f9f7f6';
    const textColor = theme === 'dark' ? '#F5EDE9' : '#2C1F1F';
    const cardBg = theme === 'dark' ? '#252220' : '#FFFFFF';
    const mutedText = theme === 'dark' ? '#B3A0A8' : '#8A7A82';
    const chipBg = theme === 'dark' ? '#2f2a27' : '#EDE6EA';
    const borderColor = theme === 'dark' ? '#3a3632' : '#EDE3E8';

    const [firstName, setFirstName] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    const [activeSlide, setActiveSlide] = useState(0);
    const heroScrollRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const next = (activeSlide + 1) % slides.length;
            heroScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
            setActiveSlide(next);
        }, 4000);
        return () => clearInterval(timer);
    }, [activeSlide]);

    function handleHeroScroll(event) {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setActiveSlide(slideIndex);
    }

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }

    useEffect(() => {
        loadUser();
        if (!isLowBattery) {
            loadProducts();
        } else {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCartSummary();
        }, [])
    );

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser();
        const name = user?.user_metadata?.first_name;
        if (name) setFirstName(name);
    }

    async function loadProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('*');

        if (error) {
            console.log('home products error:', error);
        } else {
            setProducts(data || []);
            const unique = [...new Set((data || []).map(p => p.category).filter(Boolean))];
            setCategories(unique);
        }
        setLoading(false);
    }

    async function loadCartSummary() {
        try {
            const value = await AsyncStorage.getItem('cart');
            const cart = value ? JSON.parse(value) : [];
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setCartCount(count);
            setCartTotal(total);
        } catch (error) {
            console.log('cart summary error:', error);
        }
    }

    const picks = pickFeatured(products, 3);

    return (
        <SafeAreaView edges={['top']} style={[styles.safearea, { backgroundColor: background }]}>
            <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>

                {Offline && (
                    <View style={styles.offlinebanner}>
                        <Ionicons name="cloud-offline-outline" size={16} color="white" />
                        <Text style={styles.offlinetext}>No Network Connection</Text>
                    </View>
                )}

                <View style={styles.headerRow}>
                    <Image
                        source={require('../assets/images/logo no bg.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.scanIconButton}
                        onPress={() => navigation.navigate('Barcodescanner')}
                    >
                        <Ionicons name="barcode-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.greetingWrap}>
                    <Text style={[styles.greeting, { color: textColor }]}>
                        {getGreeting()}{firstName ? `, ${firstName}` : ''}
                    </Text>
                    <Text style={[styles.greetingSub, { color: mutedText }]}>
                        Find your next favourite scent
                    </Text>
                </View>

                {cartCount > 0 && (
                    <TouchableOpacity
                        style={[styles.resumeCard, { backgroundColor: cardBg, borderColor }]}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <View style={[styles.resumeIcon, { backgroundColor: chipBg }]}>
                            <Ionicons name="cart" size={20} color="#c2b5be" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.resumeTitle, { color: textColor }]}>
                                You left {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                            </Text>
                            <Text style={styles.resumeTotal}>
                                {cartTotal.toFixed(2)} {selectedcurrency}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={mutedText} />
                    </TouchableOpacity>
                )}

                <View style={[styles.heroContainer, { height: HERO_HEIGHT }]}>
                    <ScrollView
                        ref={heroScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleHeroScroll}
                    >
                        {slides.map((slide, index) => (
                            <View key={index} style={[styles.heroSlide, { height: HERO_HEIGHT }]}>
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

                    <View style={styles.dotsRow}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, index === activeSlide && styles.dotActive]}
                            />
                        ))}
                    </View>
                </View>

                {categories.length > 1 && (
                    <View style={styles.chipsSection}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Shop by Category</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsRow}
                        >
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[styles.chip, { backgroundColor: chipBg }]}
                                    onPress={() => navigation.navigate('Products', { category })}
                                >
                                    <Text style={[styles.chipText, { color: textColor }]}>{category}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.picksSection}>
                    <View style={styles.picksHeaderRow}>
                        <Text style={[styles.picksTitle, { color: textColor }]}>Picks for this Season</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#c2b5be" style={{ marginVertical: 30 }} />
                    ) : picks.length === 0 ? (
                        <Text style={[styles.emptytext, { color: mutedText }]}>
                            {isLowBattery ? 'Sync paused — battery low' : 'No products available right now'}
                        </Text>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.picksRow}
                        >
                            {picks.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={[styles.pickCard, { width: PICK_CARD_WIDTH, backgroundColor: cardBg, borderColor }]}
                                    onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
                                >
                                    <View style={[styles.pickImageWrap, { backgroundColor: chipBg }]}>
                                        {product.imageurl ? (
                                            <Image source={{ uri: product.imageurl }} style={styles.pickImage} resizeMode="cover" />
                                        ) : (
                                            <Ionicons name="flame-outline" size={32} color="#c2b5be" />
                                        )}
                                    </View>

                                    {product.stock > 0 && product.stock < 5 && (
                                        <View style={styles.lowstockBadge}>
                                            <Text style={styles.lowstockText}>{product.stock} left</Text>
                                        </View>
                                    )}

                                    <Text style={[styles.pickName, { color: textColor }]} numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <Text style={styles.pickPrice}>
                                        {product.price} {selectedcurrency}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={[styles.actionsSection, { backgroundColor: cardBg }]}>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionTile, { backgroundColor: chipBg }]}
                            onPress={() => navigation.navigate('Storelocator')}
                        >
                            <Ionicons name="location-outline" size={20} color="#c2b5be" />
                            <Text style={[styles.actionText, { color: textColor }]}>Stores</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionTile, { backgroundColor: chipBg }]}
                            onPress={() => navigation.navigate('Orderhistory')}
                        >
                            <Ionicons name="receipt-outline" size={20} color="#c2b5be" />
                            <Text style={[styles.actionText, { color: textColor }]}>Orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionTile, { backgroundColor: chipBg }]}
                            onPress={() => navigation.navigate('Imagepicker')}
                        >
                            <Ionicons name="camera-outline" size={20} color="#c2b5be" />
                            <Text style={[styles.actionText, { color: textColor }]}>Upload</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Image
                        source={require('../assets/images/logo no bg.png')}
                        style={styles.footerLogo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.footerTagline, { color: mutedText }]}>
                        Handcrafted candles, delivered with care
                    </Text>
                    <Text style={[styles.footerCopyright, { color: mutedText }]}>
                        © 2026 Luxe Éclat
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    safearea: { flex: 1 },
    screen: { flex: 1 },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 4,
    },

    logoImage: { width: 150, height: 70 },

    scanIconButton: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#c2b5be',
        alignItems: 'center', justifyContent: 'center',
    },

    greetingWrap: { paddingHorizontal: 20, marginTop: 4, marginBottom: 14 },
    greeting: { fontSize: 22, fontWeight: '700' },
    greetingSub: { fontSize: 13, marginTop: 2 },

    resumeCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginHorizontal: 20, marginBottom: 16, padding: 14, borderRadius: 14, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    resumeIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    resumeTitle: { fontSize: 14, fontWeight: '600' },
    resumeTotal: { fontSize: 13, color: '#c2b5be', fontWeight: '700', marginTop: 2 },

    heroContainer: { width: '100%', marginBottom: 20 },
    heroSlide: { width: SCREEN_WIDTH },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: {
        position: 'absolute', width: '100%', height: '100%',
        backgroundColor: 'rgba(44, 31, 31, 0.45)',
    },
    heroTextWrap: {
        position: 'absolute', width: '100%', height: '100%',
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
    },
    heroTitle: {
        color: '#f9f7f6', fontSize: 20, fontWeight: '700',
        textAlign: 'center', marginBottom: 4,
    },
    heroSubtitle: { color: '#EDE6EA', fontSize: 14, textAlign: 'center', marginBottom: 16 },
    heroButton: { backgroundColor: '#c2b5be', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
    heroButtonText: { color: 'white', fontWeight: '700', fontSize: 13 },

    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    dot: { width: 20, height: 3, borderRadius: 2, backgroundColor: '#EDE3E8' },
    dotActive: { backgroundColor: '#c2b5be' },

    chipsSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 20, marginBottom: 10 },
    chipsRow: { paddingHorizontal: 20, gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    chipText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },

    picksSection: { marginBottom: 24 },
    picksHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 12,
    },
    picksTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
    seeAllText: { fontSize: 13, fontWeight: '700', color: '#c2b5be' },

    emptytext: { fontSize: 14, textAlign: 'center', marginVertical: 30, paddingHorizontal: 20 },

    picksRow: { paddingHorizontal: 20, gap: 14 },
    pickCard: {
        borderRadius: 18, padding: 14, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    },
    pickImageWrap: {
        width: '100%', height: 110, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden',
    },
    pickImage: { width: '100%', height: '100%' },

    lowstockBadge: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: '#FBF0E1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    },
    lowstockText: { fontSize: 10, fontWeight: '700', color: '#C2883C' },

    pickName: { fontSize: 14, fontWeight: '700', marginBottom: 2, lineHeight: 18 },
    pickPrice: { fontSize: 13, fontWeight: '700', color: '#c2b5be' },

    actionsSection: {
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 20, paddingBottom: 24, paddingHorizontal: 16,
    },
    actionsRow: { flexDirection: 'row', gap: 10 },
    actionTile: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 16, borderRadius: 14,
    },
    actionText: { fontSize: 12, fontWeight: '600' },

    footer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 6 },
    footerLogo: { width: 100, height: 50, marginBottom: 4, opacity: 0.8 },
    footerTagline: { fontSize: 12, textAlign: 'center' },
    footerCopyright: { fontSize: 11, marginTop: 6 },

    offlinebanner: {
        backgroundColor: '#B5504A', flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 8, paddingVertical: 10,
    },
    offlinetext: { color: 'white', fontWeight: '700', fontSize: 13 },
});