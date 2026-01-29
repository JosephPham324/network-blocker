
const STORAGE_KEYS = {
  FOCUS_SESSIONS: "gamification_sessions",
  CURRENCY: "gamification_currency",
  INVENTORY: "gamification_inventory",
  STREAK: "gamification_streak",
};

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
        JSON.stringify({ current: 0, max: 0, lastActiveDate: null, history: {} })
      );
    }
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
    } else {
        data.current = 1; // RESET if broken
    }

    if (data.current > data.max) data.max = data.current;
    
    data.lastActiveDate = today;
    data.history[today] = true;
    
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(data));
    return data;
  }
};
