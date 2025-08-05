import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let cachedToken: string | null = null;
let tokenExpiry = 0;

// Helper function to wait for Firebase auth to determine the user
const waitForUser = (): Promise<User | null> =>
    new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('🔥 waitForUser timeout - Firebase auth not responding');
            reject(new Error('Firebase auth timeout'));
        }, 10000); // 10 second timeout

        if (auth.currentUser) {
            clearTimeout(timeout);
            resolve(auth.currentUser);
        } else {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                clearTimeout(timeout);
                unsubscribe();
                resolve(user);
            });
        }
    });

const isTokenExpired = () => Date.now() > tokenExpiry - 60_000; // 1 min early refresh

export const getValidToken = async (): Promise<string | null> => {
    try {
        const user = await waitForUser();
        if (!user) {
            console.log('🔥 No user found in getValidToken');
            return null;
        }

        if (!cachedToken || isTokenExpired()) {
            console.log('🔥 Refreshing token...');
            const tokenResult = await user.getIdTokenResult(true);
            cachedToken = tokenResult.token;
            tokenExpiry = new Date(tokenResult.expirationTime).getTime();
            console.log('🔥 Token refreshed successfully');
        }
        return cachedToken;
    } catch (error) {
        console.error('🔥 Token refresh failed:', error);
        // Clear cached token on error
        cachedToken = null;
        tokenExpiry = 0;
        await signOut(auth);
        return null;
    }
};

// 🔒 Block requests entirely if there's no valid token
instance.interceptors.request.use(
    async (config) => {
        if (window.location.pathname === '/login') {
            // Skip token check for `/login`
            return config;
        }

        const token = await getValidToken();
        if (!token) {
            console.error('🚫 No valid token found. Blocking request.');
            return Promise.reject(new Error('Unauthorized: No valid token'));
        }
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;