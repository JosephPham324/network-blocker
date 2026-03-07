import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// In React Native, we use AsyncStorage for persistence
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

let app;
let auth;
let db;
let appId;
let isCloudReady = false;

const firebaseConfig = {
    apiKey: "AIzaSyDd7aTLw6Q-Wq4g4pbmivrqniZ6Lrch9uo",
    authDomain: "mindfulblock-33657.firebaseapp.com",
    projectId: "mindfulblock-33657",
    storageBucket: "mindfulblock-33657.firebasestorage.app",
    messagingSenderId: "246566415924",
    appId: "1:246566415924:web:57e74c4c189b7a37d06461",
    measurementId: "G-EE1LYBN7SZ",
};

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApp();
    try {
      auth = getAuth(app);
    } catch (err) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  }

  db = getFirestore(app);
  appId = "1:246566415924:web:57e74c4c189b7a37d06461";
  isCloudReady = true;
} catch (e) {
  console.error("Firebase Init Error:", e);
}

export { db, auth, appId, isCloudReady };
