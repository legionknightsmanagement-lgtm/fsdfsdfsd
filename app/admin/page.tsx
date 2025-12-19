'use client';

import AdvancedAdminDashboard from '../../components/AdvancedAdminDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export default function AdminPage() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div style={{
                background: '#090a0b',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#53FC18',
                fontFamily: 'monospace'
            }}>
                AUTHENTICATING SECURE CREDENTIALS...
            </div>
        );
    }

    if (!user || !user.isAdmin) {
        return null; // Will redirect in useEffect
    }

    return <AdvancedAdminDashboard isOpen={true} onClose={() => router.push('/')} />;
}
