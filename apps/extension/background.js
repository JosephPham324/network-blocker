const SERVER_URL = "http://127.0.0.1:17430/rules";
let blockedRules = []; // Array of { domain: "...", mode: "..." }
let currentLanguage = "vi";

// Fetch rules from Desktop App
async function fetchRules() {
  try {
    const response = await fetch(SERVER_URL);
    if (response.ok) {
      const data = await response.json();
      
      // Handle both old format (array of strings) and new format (object)
      if (Array.isArray(data)) {
         // Fallback for old version
         blockedRules = data.map(d => ({ domain: d, mode: 'friction' }));
      } else {
         blockedRules = data.rules || [];
         currentLanguage = data.language || "vi";
      }
      console.log("Updated blocked rules:", blockedRules);
    }
  } catch (error) {
    console.warn("Failed to fetch blocked domains from MindfulBlock Desktop:", error);
  }
}

// Initial fetch and periodic poll
fetchRules();
setInterval(fetchRules, 30000); // Poll every 30 seconds

// Check blocking logic
// Report to Desktop App
async function reportEvent(type, domain) {
  try {
    await fetch("http://127.0.0.1:17430/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, domain })
    });
  } catch (e) {
    // Ignore errors (desktop app might be closed)
  }
}

// Check blocking logic
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame

  const url = new URL(details.url);
  const hostname = url.hostname.replace(/^www\./, "");

  // Check if blocked
  const matchedRule = blockedRules.find(r => hostname === r.domain || hostname.endsWith("." + r.domain));

  if (matchedRule) {
    // Check if whitelisted (Temporary Unblock)
    const store = await chrome.storage.local.get("whitelisted");
    const whitelisted = store.whitelisted || {};
    const expiry = whitelisted[hostname];

    if (expiry && Date.now() < expiry) {
      return; // Allowed
    }

    // Report "block" event
    reportEvent("block", hostname);

    // Redirect to Block Screen
    // Pass Mode and Language
    const blockUrl = chrome.runtime.getURL("block.html") + 
        "?url=" + encodeURIComponent(details.url) + 
        "&mode=" + encodeURIComponent(matchedRule.mode) +
        "&lang=" + encodeURIComponent(currentLanguage);
        
    chrome.tabs.update(details.tabId, { url: blockUrl });
  }
});
