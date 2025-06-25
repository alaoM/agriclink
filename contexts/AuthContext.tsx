// providers/AuthProvider.tsx
// Global authentication context to protect routes and persist JWT.
// Usage:
//   <AuthProvider>
//      <RootLayout />   // your Slot/Stack
//   </AuthProvider>
// Then in pages/components:
//   const { user, token, signIn, signOut } = useAuth();

import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    /** Called after successful login */
    signIn: (payload: { token: string; user: User; remember: boolean }) => Promise<void>;
    /** Clear creds and navigate to login */
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "_xTkn";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /* Load token on mount */
    useEffect(() => {
        (async () => {
            const saved = await SecureStore.getItemAsync(TOKEN_KEY);
            if (saved) {
                setToken(saved);
                // optionally decode JWT to get user info
            }
            setLoading(false);
        })();
    }, []);

    const signIn: AuthContextValue['signIn'] = async ({ token, user, remember }) => {
        setUser(user);
        setToken(token);
        if (remember) {
            await SecureStore.setItemAsync("_user", JSON.stringify(user));

            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    };

    const signOut = async () => {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        Toast.show({ type: 'success', text1: 'Signed out' });
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
