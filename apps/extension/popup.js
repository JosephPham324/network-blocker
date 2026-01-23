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

document.addEventListener('DOMContentLoaded', checkConnection);
setInterval(checkConnection, 5000);
