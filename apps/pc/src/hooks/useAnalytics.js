import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { doc, setDoc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";

export const useAnalytics = (user) => {
  const [stats, setStats] = useState({
    total_blocked: 0,
    total_overrides: 0,
    time_saved_minutes: 0
  });

  // Calculate Date ID (YYYY-MM-DD)
  const getTodayId = () => new Date().toISOString().split('T')[0];

  // 1. Listen for Real-time Updates from Firebase
  useEffect(() => {
    if (!user || !isCloudReady || !db) return;

    const today = getTodayId();
    const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/stats/${today}`);

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          total_blocked: data.total_blocked_attempts || 0,
          total_overrides: data.friction_overrides || 0,
          // Heuristic: 5 mins per block?
          time_saved_minutes: (data.total_blocked_attempts || 0) * 5
        });
      } else {
        setStats({ total_blocked: 0, total_overrides: 0, time_saved_minutes: 0 });
      }
    });

    return () => unsub();
  }, [user]);

  // 2. Listen for Tauri Events from Rust Backend
  useEffect(() => {
    if (!user || !isCloudReady || !db) return;

    let unlisten;

    const setupListener = async () => {
      unlisten = await listen("analytics_event", async (event) => {
        try {
          const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          const { type, domain } = payload;
          
          console.log("[Analytics] Received:", type, domain);

          const today = getTodayId();
          const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/stats/${today}`);

          // Update Firestore
          // We use setDoc with merge: true to handle non-existent docs
          const updatePayload = {
             updated_at: serverTimestamp()
          };

          if (type === "block") {
              updatePayload.total_blocked_attempts = increment(1);
              updatePayload[`domain_stats.${domain.replace(/\./g, '_')}.blocked`] = increment(1);
          } else if (type === "override") {
              updatePayload.friction_overrides = increment(1);
              updatePayload[`domain_stats.${domain.replace(/\./g, '_')}.overridden`] = increment(1);
          }

          await setDoc(docRef, updatePayload, { merge: true });

        } catch (e) {
          console.error("Error processing analytics event:", e);
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [user]);

  return stats;
};
