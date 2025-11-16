import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Text,
    Modal,
    Button,
    TextInput,
    Portal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface RatingModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (stars: number, comment?: string) => void;
    incidentId: string;
}

export default function RatingModal({
                                        visible,
                                        onDismiss,
                                        onSubmit,
                                        incidentId,
                                    }: RatingModalProps) {
    const [selectedStars, setSelectedStars] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (selectedStars === 0) {
            alert('Por favor, selecione uma classificação');
            return;
        }

        setSubmitting(true);
        await onSubmit(selectedStars, comment);
        setSubmitting(false);
        setSelectedStars(0);
        setComment('');
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modal}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Como foi o reparo? ⭐</Text>

                    {/* Estrelas */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <MaterialCommunityIcons
                                key={star}
                                name={selectedStars >= star ? 'star' : 'star-outline'}
                                size={40}
                                color={selectedStars >= star ? Colors.warning : Colors.textLight}
                                style={styles.star}
                                onPress={() => setSelectedStars(star)}
                            />
                        ))}
                    </View>

                    {/* Comentário */}
                    <TextInput
                        label="Deixe um comentário (opcional)"
                        value={comment}
                        onChangeText={setComment}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                        placeholder="Como foi sua experiência?"
                    />

                    {/* Botões */}
                    <View style={styles.buttons}>
                        <Button
                            mode="outlined"
                            onPress={onDismiss}
                            style={styles.button}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={styles.button}
                            loading={submitting}
                            disabled={submitting}
                        >
                            Enviar
                        </Button>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    content: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    star: {
        padding: 4,
    },
    input: {
        marginBottom: 16,
        backgroundColor: Colors.background,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
