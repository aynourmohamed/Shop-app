import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

const BarcodeScanner = () => {
    const [barcode, setBarcode] = useState('');

    const handleBarCodeRead = ({ data }) => {
        setBarcode(data);
        alert(`Barcode scanned: ${data}`);
    };

    return (
        <View style={styles.container}>
            <Camera
                style={styles.preview}
                onBarCodeRead={handleBarCodeRead}
                captureAudio={false}
            />
            {barcode ? <Text style={styles.barcodeText}>{barcode}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    barcodeText: {
        fontSize: 18,
        color: 'black',
        margin: 20,
    },
});

export default BarcodeScanner;