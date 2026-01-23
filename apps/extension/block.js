document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url');
    let hostname = "";

    try {
        hostname = new URL(targetUrl).hostname.replace(/^www\./, "");
    } catch (e) {
        hostname = "unknown";
    }

    // Generate Math Challenge
    const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
    const num2 = Math.floor(Math.random() * 10) + 2;  // 2-11
    const correctAnswer = num1 * num2; // Multiplication is harder than addition
    
    document.getElementById('equation').textContent = `${num1} × ${num2} = ?`;

    const answerInput = document.getElementById('answer');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('error');

    function checkAnswer() {
        const val = parseInt(answerInput.value);
        if (val === correctAnswer) {
            // Success
            unlock();
        } else {
            // Fail
            errorMsg.style.display = 'block';
            answerInput.value = '';
            answerInput.focus();
        }
    }

    async function reportEvent(type, domain) {
      try {
        await fetch("http://127.0.0.1:17430/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, domain })
        });
      } catch (e) { console.warn(e); }
    }

    async function unlock() {
        // Report Override
        await reportEvent("override", hostname);

        const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        
        const store = await chrome.storage.local.get("whitelisted");
        const whitelisted = store.whitelisted || {};
        whitelisted[hostname] = expiry;

        await chrome.storage.local.set({ whitelisted });
        
        // Redirect back
        window.location.href = targetUrl;
    }

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    
    answerInput.focus();
});
