import React, { useState } from 'react';
import {View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import { Text, Title, HelperText, TextInput as PaperInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { Colors } from '../../constants/colors';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    // Validação de email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Função de login
    const handleLogin = async () => {
        let hasError = false;
        const newErrors = { email: '', password: '' };

        // Validação do email
        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório';
            hasError = true;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email inválido';
            hasError = true;
        }

        // Validação da senha
        if (!password.trim()) {
            newErrors.password = 'Senha é obrigatória';
            hasError = true;
        } else if (password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) return;

        // Validação contra AsyncStorage
        setLoading(true);
        try {
            const users = await AsyncStorage.getItem('@tapaburaco_users');
            const userList = users ? JSON.parse(users) : [];

            const user = userList.find(
                (u: any) =>
                    u.email.toLowerCase() === email.toLowerCase() &&
                    u.password === password
            );

            if (!user) {
                Alert.alert('Erro', 'Email ou senha incorretos');
                setLoading(false);
                return;
            }

            // Salva usuário logado
            await AsyncStorage.setItem('@tapaburaco_current_user', JSON.stringify(user));

            // Se sucesso, navega para Home
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Title style={styles.title}>🚧 TapaBuraco</Title>
                    <Text style={styles.subtitle}>
                        Ajudando a construir cidades melhores
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <FormInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                        left={<PaperInput.Icon icon="email" />}
                    />
                    {errors.email ? (
                        <HelperText type="error" visible={!!errors.email}>
                            {errors.email}
                        </HelperText>
                    ) : null}

                    <FormInput
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        error={errors.password}
                        left={<PaperInput.Icon icon="lock" />}
                    />
                    {errors.password ? (
                        <HelperText type="error" visible={!!errors.password}>
                            {errors.password}
                        </HelperText>
                    ) : null}

                    <FormButton
                        title="Entrar"
                        onPress={handleLogin}
                        mode="contained"
                        loading={loading}
                        disabled={loading}
                        icon="login"
                    />

                    <FormButton
                        title="Esqueci minha senha"
                        onPress={() => console.log('Recuperar senha')}
                        mode="text"
                    />

                    <View style={styles.divider}>
                        <Text style={styles.dividerText}>ou</Text>
                    </View>

                    <FormButton
                        title="Criar nova conta"
                        onPress={() => router.push('/auth/register')}
                        mode="outlined"
                        icon="account-plus"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    divider: {
        marginVertical: 16,
        alignItems: 'center',
    },
    dividerText: {
        color: Colors.textLight,
        fontSize: 14,
    },
});
