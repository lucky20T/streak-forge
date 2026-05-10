import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const provider = new GoogleAuthProvider();

export function useAuth() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser || null);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = () => signInWithPopup(auth, provider);
    const logout = () => signOut(auth);

    return { user, authLoading, signInWithGoogle, logout };
}
