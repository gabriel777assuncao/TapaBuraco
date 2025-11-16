import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Colors } from './colors';

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: Colors.primary,
        secondary: Colors.secondary,
        background: Colors.background,
        surface: Colors.surface,
        error: Colors.error,
    },
};
