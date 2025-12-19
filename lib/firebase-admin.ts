import * as admin from 'firebase-admin';

// Reusable initialization logic
function getAdminApp() {
    if (!admin.apps.length) {
        // Build-time safety: If env vars are missing, don't try to initialize the real app
        // This prevents the "Default app does not exist" error during Vercel's build phase
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn("⚠️ Firebase Admin Environment Variables are missing. Skipping initialization (expected during build).");
            return null;
        }

        try {
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                databaseURL: "https://ssbnerrdndaodata-default-rtdb.firebaseio.com/"
            });
        } catch (error) {
            console.error("❌ Firebase Admin initialization failed:", error);
            return null;
        }
    }
    return admin.app();
}

// Export getters instead of raw constants to avoid build-time evaluation crashes
export const getAdminDb = () => {
    const app = getAdminApp();
    if (!app) {
        throw new Error("Firebase Admin App failed to initialize. Check your Environment Variables (FIREBASE_PROJECT_ID, etc.).");
    }
    return admin.firestore();
};

export const getAdminAuth = () => {
    const app = getAdminApp();
    if (!app) {
        throw new Error("Firebase Admin App failed to initialize. Check your Environment Variables (FIREBASE_PROJECT_ID, etc.).");
    }
    return admin.auth();
};

export const getAdminRtdb = () => {
    const app = getAdminApp();
    if (!app) {
        throw new Error("Firebase Admin App failed to initialize. Check your Environment Variables (FIREBASE_PROJECT_ID, etc.).");
    }
    return admin.database();
};

// Legacy support
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
