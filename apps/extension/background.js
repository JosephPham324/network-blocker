const SERVER_URL = "http://127.0.0.1:17430/rules";
let blockedDomains = [];

// Fetch rules from Desktop App
async function fetchRules() {
  try {
    const response = await fetch(SERVER_URL);
    if (response.ok) {
      const rules = await response.json();
      blockedDomains = rules;
      console.log("Updated blocked domains:", blockedDomains);
    }
  } catch (error) {
    console.warn("Failed to fetch blocked domains from MindfulBlock Desktop:", error);
  }
}

// Initial fetch and periodic poll
fetchRules();
setInterval(fetchRules, 30000); // Poll every 30 seconds

// Check blocking logic
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame

  const url = new URL(details.url);
  const hostname = url.hostname.replace(/^www\./, "");

  // Check if blocked
  const isBlocked = blockedDomains.some(domain => hostname === domain || hostname.endsWith("." + domain));

  if (isBlocked) {
    // Check if whitelisted (Temporary Unblock)
    const store = await chrome.storage.local.get("whitelisted");
    const whitelisted = store.whitelisted || {};
    const expiry = whitelisted[hostname];

    if (expiry && Date.now() < expiry) {
      return; // Allowed
    }

    // Redirect to Block Screen
    const blockUrl = chrome.runtime.getURL("block.html") + "?url=" + encodeURIComponent(details.url);
    chrome.tabs.update(details.tabId, { url: blockUrl });
  }
});
