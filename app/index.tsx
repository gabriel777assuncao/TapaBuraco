import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/colors';

export default function Index() {
    return <Redirect href="/auth/login" />;
}
