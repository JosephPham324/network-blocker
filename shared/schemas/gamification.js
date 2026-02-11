export const STORAGE_KEYS = {
  FOCUS_SESSIONS: "gamification_sessions",
  CURRENCY: "gamification_currency",
  INVENTORY: "gamification_inventory",
  STREAK: "gamification_streak",
  BUFFS: "gamification_buffs",
};

export const SHOP_PRICES = {
  SITE_PASS_10M: 3,       // 10 min pass for 1 site
  GROUP_PASS_PER_SITE: 2,  // 10 min pass per site in group (discounted)
  STREAK_FREEZE: 5,       // Protect streak for 1 missed day
  FOCUS_BOOST: 10,          // 2x tokens on next focus session
};


export const SESSION_REWARDS = {
  BASE_REWARD: 1, // 10 minutes
  BOOST_MULTIPLIER: 2,
};