'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    username: string;
    points: number;
    color?: string;
    badge?: string;
    verified?: boolean;
    isAdmin?: boolean;
    profilePic?: string;
    twoFactorEnabled?: boolean;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
    awardPoints: (amount: number) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.isLoggedIn !== false) {
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.dispatchEvent(new Event('auth_logout'));
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const awardPoints = async (amount: number) => {
        if (!user) return false;
        try {
            const res = await fetch('/api/user/award-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(prev => prev ? { ...prev, points: data.points } : null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Award points error:', error);
            return false;
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, refreshUser, logout, awardPoints }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
