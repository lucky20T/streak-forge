import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDW381b2rHT-c_7tHkfHB11-yewPHXQrI4",
    authDomain: "streakforge-5be48.firebaseapp.com",
    projectId: "streakforge-5be48",
    storageBucket: "streakforge-5be48.firebasestorage.app",
    messagingSenderId: "65706909105",
    appId: "1:65706909105:web:465080cc422ea8f9aa3190",
    measurementId: "G-ZH13QV3HH2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
