import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import {
    Text,
    Title,
    HelperText,
    TextInput as PaperInput,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    city: string;
}

interface RegisterErrors {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    city: string;
}

const USERS_STORAGE_KEY = '@tapaburaco_users';

export default function RegisterScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
    });

    const [errors, setErrors] = useState<RegisterErrors>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validações
    const validateName = (name: string): string => {
        if (!name.trim()) return 'Nome é obrigatório';
        if (name.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
        return '';
    };

    const validateEmail = (email: string): string => {
        if (!email.trim()) return 'Email é obrigatório';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email inválido';
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password) return 'Senha é obrigatória';
        if (password.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
        if (!/[A-Z]/.test(password))
            return 'Senha deve conter pelo menos uma letra maiúscula';
        if (!/[0-9]/.test(password))
            return 'Senha deve conter pelo menos um número';
        return '';
    };

    const validateConfirmPassword = (
        password: string,
        confirmPassword: string
    ): string => {
        if (!confirmPassword) return 'Confirmação de senha é obrigatória';
        if (password !== confirmPassword) return 'As senhas não conferem';
        return '';
    };

    const validatePhone = (phone: string): string => {
        if (!phone.trim()) return 'Telefone é obrigatório';
        if (phone.trim().length < 10)
            return 'Telefone deve ter pelo menos 10 dígitos';
        return '';
    };

    const validateCity = (city: string): string => {
        if (!city.trim()) return 'Cidade é obrigatória';
        if (city.trim().length < 2) return 'Cidade inválida';
        return '';
    };

    // Validar formulário inteiro
    const validateForm = (): boolean => {
        const newErrors: RegisterErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(
                formData.password,
                formData.confirmPassword
            ),
            phone: validatePhone(formData.phone),
            city: validateCity(formData.city),
        };

        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error === '');
    };

    // Registrar usuário
    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Verifica se email já existe
            const existingUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
            const users = existingUsers ? JSON.parse(existingUsers) : [];

            const emailExists = users.some(
                (user: any) => user.email.toLowerCase() === formData.email.toLowerCase()
            );

            if (emailExists) {
                Alert.alert('Erro', 'Este email já está cadastrado');
                setLoading(false);
                return;
            }

            // Cria novo usuário
            const newUser = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                password: formData.password, // Em produção, criptografar!
                phone: formData.phone,
                city: formData.city,
                totalReports: 0,
                resolvedReports: 0,
                joinedDate: new Date().toLocaleDateString('pt-BR'),
                createdAt: new Date().toISOString(),
                avatar: '👨‍💼',
            };

            // Salva novo usuário
            users.push(newUser);
            await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

            // Simula delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            Alert.alert('Sucesso! ✅', 'Conta criada com sucesso!\nAgora faça login.', [
                {
                    text: 'OK',
                    onPress: () => {
                        router.replace('/auth/login');
                    },
                },
            ]);
        } catch (error) {
            console.error('Erro ao registrar:', error);
            Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
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
                    <Title style={styles.title}>🚧 Cadastro</Title>
                    <Text style={styles.subtitle}>
                        Crie sua conta para começar a ajudar
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Nome */}
                    <FormInput
                        label="Nome Completo"
                        value={formData.name}
                        onChangeText={(text) =>
                            setFormData({ ...formData, name: text })
                        }
                        autoCapitalize="words"
                        error={errors.name}
                        left={<PaperInput.Icon icon="account" />}
                    />
                    {errors.name ? (
                        <HelperText type="error" visible={!!errors.name}>
                            {errors.name}
                        </HelperText>
                    ) : null}

                    {/* Email */}
                    <FormInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) =>
                            setFormData({ ...formData, email: text })
                        }
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

                    {/* Telefone */}
                    <FormInput
                        label="Telefone"
                        value={formData.phone}
                        onChangeText={(text) =>
                            setFormData({ ...formData, phone: text })
                        }
                        keyboardType="phone-pad"
                        error={errors.phone}
                        left={<PaperInput.Icon icon="phone" />}
                    />
                    {errors.phone ? (
                        <HelperText type="error" visible={!!errors.phone}>
                            {errors.phone}
                        </HelperText>
                    ) : null}

                    {/* Cidade */}
                    <FormInput
                        label="Cidade"
                        value={formData.city}
                        onChangeText={(text) =>
                            setFormData({ ...formData, city: text })
                        }
                        autoCapitalize="words"
                        error={errors.city}
                        left={<PaperInput.Icon icon="map-marker" />}
                    />
                    {errors.city ? (
                        <HelperText type="error" visible={!!errors.city}>
                            {errors.city}
                        </HelperText>
                    ) : null}

                    {/* Senha */}
                    <FormInput
                        label="Senha"
                        value={formData.password}
                        onChangeText={(text) =>
                            setFormData({ ...formData, password: text })
                        }
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        left={<PaperInput.Icon icon="lock" />}
                    />
                    {errors.password ? (
                        <HelperText type="error" visible={!!errors.password}>
                            {errors.password}
                        </HelperText>
                    ) : (
                        <HelperText type="info" visible={true}>
                            Min. 6 caracteres, 1 maiúscula e 1 número
                        </HelperText>
                    )}

                    {/* Confirmar Senha */}
                    <FormInput
                        label="Confirmar Senha"
                        value={formData.confirmPassword}
                        onChangeText={(text) =>
                            setFormData({ ...formData, confirmPassword: text })
                        }
                        secureTextEntry={!showConfirmPassword}
                        error={errors.confirmPassword}
                        left={<PaperInput.Icon icon="lock-check" />}
                    />
                    {errors.confirmPassword ? (
                        <HelperText type="error" visible={!!errors.confirmPassword}>
                            {errors.confirmPassword}
                        </HelperText>
                    ) : null}

                    {/* Botão de Cadastro */}
                    <FormButton
                        title="Criar Conta"
                        onPress={handleRegister}
                        mode="contained"
                        loading={loading}
                        disabled={loading}
                        icon="account-plus"
                    />

                    <View style={styles.divider}>
                        <Text style={styles.dividerText}>ou</Text>
                    </View>

                    {/* Botão de Login */}
                    <FormButton
                        title="Já tem conta? Faça login"
                        onPress={() => router.back()}
                        mode="outlined"
                        disabled={loading}
                    />

                    {/* Termo de aceito */}
                    <Text style={styles.termsText}>
                        Ao criar uma conta, você concorda com nossos{' '}
                        <Text style={styles.termsLink}>Termos de Serviço</Text> e{' '}
                        <Text style={styles.termsLink}>Política de Privacidade</Text>.
                    </Text>
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
        marginBottom: 32,
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
        marginVertical: 20,
        alignItems: 'center',
    },
    dividerText: {
        color: Colors.textLight,
        fontSize: 14,
    },
    termsText: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 16,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: Colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
