import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let db, auth, appId;
let isCloudReady = false;

try {
  const configStr = typeof __firebase_config !== "undefined" ? __firebase_config : null;
  const firebaseConfig = typeof configStr === "string" ? JSON.parse(configStr) : configStr;

  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase config is missing or invalid. App will run in Mock mode.");
  } else {
    if (!getApps().length) {
      const fbApp = initializeApp(firebaseConfig);
      auth = getAuth(fbApp);
      db = getFirestore(fbApp);
    }
    appId = typeof __app_id !== "undefined" ? __app_id : "mindful-block-prod";
    isCloudReady = true;
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

export { db, auth, appId, isCloudReady };
