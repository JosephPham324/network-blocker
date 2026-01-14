import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, setPersistence, indexedDBLocalPersistence } from "firebase/auth";

let app;
let auth;
let db;
let googleProvider;
let appId;
let isCloudReady = false;

try {
  const configStr = typeof __firebase_config !== "undefined" ? __firebase_config : null;
  const firebaseConfig = typeof configStr === "string" ? JSON.parse(configStr) : configStr;

  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.warn("Firebase config missing. Mock mode.");
  } else {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    auth = getAuth(app);

    // 🔴 MUST RUN EVERY TIME
    setPersistence(auth, indexedDBLocalPersistence).catch(console.error);

    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    appId = typeof __app_id !== "undefined" ? __app_id : "mindful-block-prod";
    isCloudReady = true;
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

export { db, auth, googleProvider, appId, isCloudReady };
