document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get('url');
    let targetUrl = "";
    
    // Try decoding base64, fallback to raw if fails (backward compatibility)
    try {
        targetUrl = atob(rawUrl);
    } catch(e) {
        targetUrl = rawUrl;
    }

    const mode = params.get('mode') || 'friction_math';
    const lang = params.get('lang') || 'vi';
    
    let hostname = "";
    try {
        hostname = new URL(targetUrl).hostname.replace(/^www\./, "");
    } catch (e) {
        hostname = "unknown";
    }

    // --- TRANSLATIONS ---
    const TRANSLATIONS = {
        vi: {
            page_title: "Tạm dừng Chánh niệm",
            page_subtitle: "Trang web này nằm trong danh sách chặn của bạn.",
            math_title: "Thử thách Toán học",
            math_error: "Chưa đúng, thử lại.",
            math_placeholder: "Kết quả là?",
            wait_title: "Khoảng nghỉ",
            wait_desc: "Hít thở sâu...",
            wait_btn_wait: "Chờ {s} giây...",
            typing_title: "Kiểm tra Ý định",
            typing_placeholder: "Gõ lại câu trên để xác nhận",
            typing_error: "Chưa chính xác.",
            unlock_btn: "Mở khóa 10 phút"
        },
        en: {
            page_title: "Mindful Pause",
            page_subtitle: "This site is on your block list.",
            math_title: "Math Challenge",
            math_error: "Incorrect, try again.",
            math_placeholder: "Result?",
            wait_title: "Mindful Pause",
            wait_desc: "Take a deep breath...",
            wait_btn_wait: "Wait {s}s...",
            typing_title: "Intention Check",
            typing_placeholder: "Type the phrase above",
            typing_error: "Text does not match.",
            unlock_btn: "Unlock for 10 Minutes"
        }
    };

    const T = TRANSLATIONS[lang] || TRANSLATIONS['en'];

    // --- APPLY TRANSLATIONS ---
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('page-title', T.page_title);
    setText('page-subtitle', T.page_subtitle);
    setText('math-title', T.math_title);
    setText('math-error', T.math_error);
    setText('wait-title', T.wait_title);
    setText('wait-desc', T.wait_desc);
    setText('typing-title', T.typing_title);
    setText('typing-error', T.typing_error);
    setText('submitBtn', T.unlock_btn);
    
    const mathInput = document.getElementById('answer');
    if(mathInput) mathInput.placeholder = T.math_placeholder;

    const typingInput = document.getElementById('typing-input');
    if(typingInput) typingInput.placeholder = T.typing_placeholder;


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
        
        document.getElementById('page-icon').textContent = "🧠";
        
        // Generate Harder Math Challenge (2 digits * 2 digits)
        const num1 = Math.floor(Math.random() * 89) + 11; // 11 to 99

        const modeDifficulty = Math.random();
        
        let question = "";
        let correctAnswer = 0;

        if (modeDifficulty > 0.5) {
             // 2-digit x 1-digit (High range) + addition
             // e.g. 87 * 7 + 15
             const a = Math.floor(Math.random() * 80) + 15;
             const b = Math.floor(Math.random() * 7) + 3;
             const c = Math.floor(Math.random() * 50) + 10;
             question = `${a} × ${b} + ${c} = ?`;
             correctAnswer = a * b + c;
        } else {
            // Pure Multiplication
            // e.g. 14 * 13
            const a = Math.floor(Math.random() * 15) + 11; 
            const b = Math.floor(Math.random() * 10) + 11;
            question = `${a} × ${b} = ?`;
            correctAnswer = a * b;
        }
        
        document.getElementById('equation').textContent = question;
        const answerInput = document.getElementById('answer');
        const errorMsg = document.getElementById('math-error');

        submitBtn.onclick = () => {
            if (parseInt(answerInput.value) === correctAnswer) unlock();
            else {
                errorMsg.style.display = 'block';
                answerInput.value = '';
                answerInput.focus();
                // Shake effect is handled by CSS animation reset?
                errorMsg.style.animation = 'none';
                errorMsg.offsetHeight; /* trigger reflow */
                errorMsg.style.animation = 'shake 0.3s ease-in-out';
            }
        };
        
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
        answerInput.focus();
    }

    function startWait() {
        waitBox.style.display = 'block';
        document.getElementById('page-icon').textContent = "⏳";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
        
        let timeLeft = 15;
        const timerEl = document.getElementById('timer');
        const progressEl = document.getElementById('progress');

        const updateBtn = () => {
             submitBtn.textContent = T.wait_btn_wait.replace("{s}", timeLeft);
        };
        updateBtn();

        const interval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            progressEl.style.width = `${(timeLeft / 15) * 100}%`;
            updateBtn();

            if (timeLeft <= 0) {
                clearInterval(interval);
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
                submitBtn.textContent = T.unlock_btn;
                submitBtn.onclick = unlock;
            }
        }, 1000);
    }

    function startTyping() {
        typingBox.style.display = 'block';
        document.getElementById('page-icon').textContent = "⌨️";
        
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
                 errorMsg.style.animation = 'none';
                 errorMsg.offsetHeight; /* trigger reflow */
                 errorMsg.style.animation = 'shake 0.3s ease-in-out';
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
