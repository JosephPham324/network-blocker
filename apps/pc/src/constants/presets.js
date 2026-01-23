export const BLOCK_PRESETS = [
  {
    id: "social_media",
    name: "Social Media Detox",
    description: "Block facebook, tiktok, and other infinite scroll traps",
    rules: [
      { domain: "facebook.com", group: "Social Media" },
      { domain: "twitter.com", group: "Social Media" },
      { domain: "x.com", group: "Social Media" },
      { domain: "instagram.com", group: "Social Media" },
      { domain: "tiktok.com", group: "Social Media" },
      { domain: "reddit.com", group: "Social Media" },
      { domain: "linkedin.com", group: "Social Media" },
      { domain: "pinterest.com", group: "Social Media" },
      { domain: "threads.net", group: "Social Media" },
      { domain: "tumblr.com", group: "Social Media" },
      { domain: "9gag.com", group: "Social Media" },
    ]
  },
  {
    id: "news_entertainment",
    name: "News & Entertainment (VN)",
    description: "Block youtube, netflix and popular VN news sites",
    rules: [
      { domain: "youtube.com", group: "Entertainment" },
      { domain: "netflix.com", group: "Entertainment" },
      { domain: "twitch.tv", group: "Entertainment" },
      { domain: "vimeo.com", group: "Entertainment" },
      { domain: "dailymotion.com", group: "Entertainment" },
      // Vietnamese News & Portals
      { domain: "vnexpress.net", group: "News" },
      { domain: "kenh14.vn", group: "News" },
      { domain: "zingnews.vn", group: "News" },
      { domain: "znews.vn", group: "News" },
      { domain: "dantri.com.vn", group: "News" },
      { domain: "tuoitre.vn", group: "News" },
      { domain: "thanhnien.vn", group: "News" },
      { domain: "24h.com.vn", group: "News" },
      { domain: "baomoi.com", group: "News" },
      { domain: "vietnamnet.vn", group: "News" },
      { domain: "soha.vn", group: "News" },
    ]
  },
  {
    id: "shopping",
    name: "Shopping Spree (VN)",
    description: "Stop impulse buying on Shopee, Lazada, etc.",
    rules: [
      { domain: "shopee.vn", group: "Shopping" },
      { domain: "lazada.vn", group: "Shopping" },
      { domain: "tiki.vn", group: "Shopping" },
      { domain: "sendo.vn", group: "Shopping" },
      { domain: "amazon.com", group: "Shopping" },
      { domain: "ebay.com", group: "Shopping" },
      { domain: "etsy.com", group: "Shopping" },
      { domain: "alibaba.com", group: "Shopping" },
      { domain: "aliexpress.com", group: "Shopping" },
      { domain: "taobao.com", group: "Shopping" },
      { domain: "1688.com", group: "Shopping" },
    ]
  },
  {
    id: "games",
    name: "Online Games",
    description: "Block web games and gaming portals",
    rules: [
      { domain: "roblox.com", group: "Games" },
      { domain: "gamevui.vn", group: "Games" },
      { domain: "y8.com", group: "Games" },
      { domain: "poki.com", group: "Games" },
      { domain: "crazygames.com", group: "Games" },
      { domain: "itch.io", group: "Games" },
      { domain: "steampowered.com", group: "Games" },
      { domain: "epicgames.com", group: "Games" },
      { domain: "riotgames.com", group: "Games" },
      { domain: "garena.vn", group: "Games" },
      { domain: "uplay.ubisoft.com", group: "Games" },
    ]
  },
  {
    id: "porn_adult",
    name: "Adult Content",
    description: "Block common adult content websites",
    rules: [
      { domain: "pornhub.com", group: "Adult" },
      { domain: "xvideos.com", group: "Adult" },
      { domain: "xnxx.com", group: "Adult" },
      { domain: "xhamster.com", group: "Adult" },
      { domain: "youporn.com", group: "Adult" },
      { domain: "redtube.com", group: "Adult" },
      { domain: "vlxx.sex", group: "Adult" },
      { domain: "thiendia.us", group: "Adult" },
      { domain: "lauxanh.us", group: "Adult" },
      { domain: "onlyfans.com", group: "Adult" },
      { domain: "stripchat.com", group: "Adult" },
      { domain: "chaturbate.com", group: "Adult" },
      { domain: "bongacams.com", group: "Adult" },
    ]
  }
];

export const SAMPLE_CSV_CONTENT = `Domain,Group,Mode
facebook.com,Social,hard
instagram.com,Social,friction
example.com,General,hard`;
