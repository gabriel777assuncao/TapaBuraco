import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import * as ImagePickerExpo from 'expo-image-picker';
import { Colors } from '../constants/colors';

interface ImagePickerProps {
    onImagePicked: (uri: string) => void;
    selectedImage?: string | null;
}

export default function ImagePickerComponent({
                                                 onImagePicked,
                                                 selectedImage,
                                             }: ImagePickerProps) {
    const pickImageFromGallery = async () => {
        const result = await ImagePickerExpo.launchImageLibraryAsync({
            mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            onImagePicked(result.assets[0].uri);
        }
    };

    const pickImageFromCamera = async () => {
        const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            alert('Permissão de câmera negada');
            return;
        }

        const result = await ImagePickerExpo.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            onImagePicked(result.assets[0].uri);
        }
    };

    return (
        <Card style={styles.container}>
            {selectedImage ? (
                <View>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="outlined"
                            onPress={pickImageFromCamera}
                            icon="camera"
                            style={styles.button}
                        >
                            Retomar foto
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={pickImageFromGallery}
                            icon="image"
                            style={styles.button}
                        >
                            Trocar foto
                        </Button>
                    </View>
                </View>
            ) : (
                <View>
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>📸 Nenhuma foto selecionada</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={pickImageFromCamera}
                            icon="camera"
                            style={styles.button}
                        >
                            Tirar Foto
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={pickImageFromGallery}
                            icon="image"
                            style={styles.button}
                        >
                            Galeria
                        </Button>
                    </View>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 12,
    },
    image: {
        width: '100%',
        height: 200,
    },
    placeholder: {
        width: '100%',
        height: 200,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
    },
    button: {
        flex: 1,
    },
});
