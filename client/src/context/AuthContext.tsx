import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty' | 'admin';
};

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, tokenData: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { }
        }
        return null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

    const login = (userData: User, tokenData: string) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
