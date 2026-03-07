import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";

export const useAnalytics = (user: any) => {
  const [stats, setStats] = useState({
    total_blocked: 0,
    total_overrides: 0,
    time_saved_minutes: 0
  });

  const getTodayId = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user || !isCloudReady || !db || user.uid === "local-user") return;

    const today = getTodayId();
    const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/stats/${today}`);

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          total_blocked: data.total_blocked_attempts || 0,
          total_overrides: data.friction_overrides || 0,
          time_saved_minutes: (data.total_blocked_attempts || 0) * 5
        });
      } else {
        setStats({ total_blocked: 0, total_overrides: 0, time_saved_minutes: 0 });
      }
    });

    return () => unsub();
  }, [user]);

  // Mobile doesn't have the Tauri real-time listener.
  // We rely fully on Firestore syncs.

  return stats;
};
