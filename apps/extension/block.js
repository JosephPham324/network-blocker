document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url');
    const mode = params.get('mode') || 'friction_math';
    const lang = params.get('lang') || 'vi';
    
    let hostname = "";
    try {
        hostname = new URL(targetUrl).hostname.replace(/^www\./, "");
    } catch (e) {
        hostname = "unknown";
    }

    const submitBtn = document.getElementById('submitBtn');
    
    // Selectors
    const mathBox = document.getElementById('math-challenge');
    const waitBox = document.getElementById('wait-challenge');
    const typingBox = document.getElementById('typing-challenge');

    // Init Logic
    if (mode === 'friction_wait') {
        startWait();
    } else if (mode === 'friction_typing') {
        startTyping();
    } else {
        startMath();
    }

    // --- LOGIC ---

    function startMath() {
        mathBox.style.display = 'block';
        
        // Generate Math Challenge
        const num1 = Math.floor(Math.random() * 20) + 10; 
        const num2 = Math.floor(Math.random() * 10) + 2;
        const correctAnswer = num1 * num2;
        
        document.getElementById('equation').textContent = `${num1} × ${num2} = ?`;
        const answerInput = document.getElementById('answer');
        const errorMsg = document.getElementById('error');

        submitBtn.onclick = () => {
            if (parseInt(answerInput.value) === correctAnswer) unlock();
            else {
                errorMsg.style.display = 'block';
                answerInput.value = '';
                answerInput.focus();
            }
        };
        
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
        answerInput.focus();
    }

    function startWait() {
        waitBox.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
        submitBtn.textContent = "Wait 15s...";

        let timeLeft = 15;
        const timerEl = document.getElementById('timer');
        const progressEl = document.getElementById('progress');

        const interval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            progressEl.style.width = `${(timeLeft / 15) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(interval);
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.textContent = "Unlock for 10 Minutes";
                submitBtn.onclick = unlock;
            }
        }, 1000);
    }

    function startTyping() {
        typingBox.style.display = 'block';
        
        const phrases = {
            vi: "Tôi chọn sự xao nhãng thay vì mục tiêu của mình",
            en: "I choose distraction over my goals"
        };
        const targetPhrase = phrases[lang] || phrases['en'];
        
        document.getElementById('typing-prompt').textContent = targetPhrase;
        const input = document.getElementById('typing-input');
        const errorMsg = document.getElementById('typing-error');

        submitBtn.onclick = () => {
             if (input.value.trim().toLowerCase() === targetPhrase.toLowerCase()) {
                 unlock();
             } else {
                 errorMsg.style.display = 'block';
                 input.value = '';
                 input.focus();
             }
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
        input.focus();
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
});
