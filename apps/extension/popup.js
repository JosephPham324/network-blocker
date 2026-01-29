const SERVER_URL = "http://127.0.0.1:17430/rules";

async function checkConnection() {
    const statusEl = document.getElementById('appStatus');
    try {
        const response = await fetch(SERVER_URL);
        if (response.ok) {
            statusEl.innerHTML = '<span class="indicator status-online"></span>Connected';
            statusEl.style.color = '#10b981';
        } else {
            throw new Error();
        }
    } catch (e) {
        statusEl.innerHTML = '<span class="indicator status-offline"></span>Disconnected';
        statusEl.style.color = '#ef4444';
    }
}

async function checkCurrentSite() {
    const siteStatusItem = document.getElementById('siteStatusItem');
    const siteStatusEl = document.getElementById('siteStatus');
    
    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            siteStatusItem.style.display = 'none';
            return;
        }

        // Parse URL
        const url = new URL(tab.url);
        const hostname = url.hostname.replace(/^www\./, "");

        // Check if whitelisted
        const store = await chrome.storage.local.get("whitelisted");
        const whitelisted = store.whitelisted || {};
        const expiry = whitelisted[hostname];

        if (expiry && Date.now() < expiry) {
            // Show time remaining
            const timeLeft = Math.ceil((expiry - Date.now()) / 1000 / 60); // Minutes
            siteStatusItem.style.display = 'flex';
            siteStatusEl.textContent = `Unlocked (${timeLeft}m left)`;
            siteStatusEl.style.color = '#10b981';
        } else {
            siteStatusItem.style.display = 'none';
        }
    } catch (e) {
        siteStatusItem.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkConnection();
    checkCurrentSite();
});

setInterval(checkConnection, 5000);
setInterval(checkCurrentSite, 1000); // Update every second for live countdown
