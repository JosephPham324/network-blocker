import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { STORAGE_KEYS, SHOP_PRICES } from "../../../../shared/schemas/gamification";

export const GamificationService = {
  // --- Initialize ---
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.CURRENCY)) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENCY,
        JSON.stringify({ balance: 0, totalEarned: 0, history: [] })
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(
        STORAGE_KEYS.INVENTORY,
        JSON.stringify({ trees: [], themes: ["light"] })
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.STREAK)) {
      localStorage.setItem(
        STORAGE_KEYS.STREAK,
        JSON.stringify({ current: 0, max: 0, lastActiveDate: null, history: {}, freezes: 0 })
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUFFS)) {
      localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify([]));
    }
  },

  // --- Cloud Sync ---
  saveToCloud: async (userId) => {
    if (!userId || !db) return;
    const data = {
      currency: JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENCY)),
      inventory: JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)),
      streak: JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK)),
      buffs: JSON.parse(localStorage.getItem(STORAGE_KEYS.BUFFS)),
      lastUpdated: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "users", userId, "gamification", "data"), data);
      console.log("Gamification data saved to cloud");
    } catch (e) {
      console.error("Failed to save gamification data", e);
    }
  },

  loadFromCloud: async (userId) => {
    if (!userId || !db) return;
    try {
      const docRef = doc(db, "users", userId, "gamification", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(data.currency));
        if (data.inventory) localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data.inventory));
        if (data.streak) localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data.streak));
        if (data.buffs) localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify(data.buffs));
        console.log("Gamification data loaded from cloud");
        return true; // Data loaded
      }
    } catch (e) {
      console.error("Failed to load gamification data", e);
    }
    return false;
  },

  subscribeToCloud: (userId, onUpdate) => {
    if (!userId || !db) return () => {};
    const docRef = doc(db, "users", userId, "gamification", "data");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Only update local if remote is newer? 
        // For now, simpler: just update local and notify component to re-render
        if (data.currency) localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(data.currency));
        if (data.inventory) localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data.inventory));
        if (data.streak) localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data.streak));
        if (data.buffs) localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify(data.buffs));
        if (onUpdate) onUpdate();
      }
    });
    return unsubscribe;
  },

  // --- Currency ---
  getBalance: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENCY)) || { balance: 0 };
    } catch { return { balance: 0 }; }
  },

  addTokens: (amount, reason) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENCY));
    data.balance += amount;
    data.totalEarned += amount;
    data.history.push({ date: new Date().toISOString(), amount, reason, type: 'earn' });
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(data));
    return data;
  },

  spendTokens: (amount, item) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENCY));
    if (data.balance < amount) return false;
    data.balance -= amount;
    data.history.push({ date: new Date().toISOString(), amount, reason: item, type: 'spend' });
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(data));
    return true;
  },

  // --- Inventory (Garden) ---
  getTrees: () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY))?.trees || [];
    } catch { return []; }
  },

  plantTree: (type) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY));
    data.trees.push({ type, plantedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data));
    return data.trees;
  },

  // ========================================
  // --- Buffs / Passes (NEW) ---
  // ========================================

  /**
   * Activates a temporary buff (pass).
   * @param {'SITE_PASS' | 'GROUP_PASS' | 'FOCUS_BOOST'} type
   * @param {string} target - Domain name or Group name
   * @param {number} durationMs - Duration in milliseconds
   */
  activateBuff: (type, target, durationMs) => {
    const buffs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUFFS)) || [];
    buffs.push({
      id: `buff_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      target,
      activatedAt: Date.now(),
      expiresAt: Date.now() + durationMs,
    });
    localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify(buffs));
  },

  /**
   * Returns only active (non-expired) buffs. Also cleans up expired ones.
   */
  getActiveBuffs: () => {
    try {
      const buffs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUFFS)) || [];
      const now = Date.now();
      const active = buffs.filter(b => b.expiresAt > now);
      // Cleanup expired
      if (active.length !== buffs.length) {
        localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify(active));
      }
      return active;
    } catch { return []; }
  },

  /**
   * Buy a Site Pass: spend tokens, activate buff.
   * @param {string} domain
   * @returns {boolean} success
   */
  buySitePass: (domain) => {
    const cost = SHOP_PRICES.SITE_PASS_10M;
    if (!GamificationService.spendTokens(cost, `Site Pass: ${domain}`)) return false;
    GamificationService.activateBuff('SITE_PASS', domain, 10 * 60 * 1000); // 10 min
    return true;
  },

  /**
   * Buy a Group Pass: price scales with number of sites.
   * @param {string} groupName
   * @param {number} siteCount - Number of sites in the group
   * @returns {boolean} success
   */
  buyGroupPass: (groupName, siteCount) => {
    const cost = SHOP_PRICES.GROUP_PASS_PER_SITE * Math.max(siteCount, 1);
    if (!GamificationService.spendTokens(cost, `Group Pass: ${groupName} (${siteCount} sites)`)) return false;
    GamificationService.activateBuff('GROUP_PASS', groupName, 10 * 60 * 1000); // 10 min
    return true;
  },

  /**
   * Buy a Streak Freeze: adds 1 freeze charge.
   * @returns {boolean} success
   */
  buyStreakFreeze: () => {
    const cost = SHOP_PRICES.STREAK_FREEZE;
    if (!GamificationService.spendTokens(cost, 'Streak Freeze')) return false;
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK));
    data.freezes = (data.freezes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data));
    return true;
  },

  /**
   * Buy a Focus Boost: 2x tokens on next focus session.
   * @returns {boolean} success
   */
  buyFocusBoost: () => {
    const cost = SHOP_PRICES.FOCUS_BOOST;
    if (!GamificationService.spendTokens(cost, 'Focus Boost (2x)')) return false;
    GamificationService.activateBuff('FOCUS_BOOST', 'next_session', 24 * 60 * 60 * 1000); // 24h expiry
    return true;
  },

  /**
   * Check if a Focus Boost is active. Consumes it if found.
   * @returns {boolean}
   */
  consumeFocusBoost: () => {
    const buffs = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUFFS)) || [];
    const now = Date.now();
    const boostIdx = buffs.findIndex(b => b.type === 'FOCUS_BOOST' && b.expiresAt > now);
    if (boostIdx === -1) return false;
    buffs.splice(boostIdx, 1); // Remove it (consumed)
    localStorage.setItem(STORAGE_KEYS.BUFFS, JSON.stringify(buffs));
    return true;
  },

  // --- Streak ---
  getStreak: () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK)) || { current: 0 };
    } catch { return { current: 0 }; }
  },

  checkin: () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK));
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    if (data.lastActiveDate === today) return data;

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (data.lastActiveDate === yesterdayStr) {
        data.current += 1;
    } else if (data.lastActiveDate && data.lastActiveDate !== today) {
        // Streak broken — check for Streak Freeze
        if ((data.freezes || 0) > 0) {
            data.freezes -= 1;
            // Streak preserved! Don't reset.
            data.current += 1; // Still count today
        } else {
            data.current = 1; // RESET if broken and no freeze
        }
    } else {
        data.current = 1; // First ever checkin
    }

    if (data.current > data.max) data.max = data.current;
    
    data.lastActiveDate = today;
    data.history[today] = true;
    
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data));
    return data;
  }
};
