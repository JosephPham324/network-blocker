import React, { createContext, useContext, useState, useEffect } from 'react';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children, setBlocking }) => {
    const [isFocusing, setIsFocusing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [timerId, setTimerId] = useState(null);

    // --- Persistence Logic ---
    useEffect(() => {
        // Validation on Load
        const storedEndTime = localStorage.getItem('focus_end_time');
        const storedTotal = localStorage.getItem('focus_total_duration');
        
        if (storedEndTime && storedTotal) {
            const end = parseInt(storedEndTime, 10);
            const now = Date.now();
            
            if (end > now) {
                // Resume Timer
                const remaining = Math.ceil((end - now) / 1000);
                setTotalDuration(parseInt(storedTotal, 10));
                setTimeLeft(remaining);
                setIsFocusing(true);
            } else {
                // Timer expired while away? 
                // Creating a logic to maybe auto-complete would be complex here due to callbacks.
                // For now, just clear it.
                localStorage.removeItem('focus_end_time');
                localStorage.removeItem('focus_total_duration');
            }
        }
    }, []);

    // --- Timer Tick ---
    useEffect(() => {
        let interval = null;
        if (isFocusing && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                         // End of Timer (Transition happens in the component or here?)
                         // We will rely on the value reaching 0 for the UI to react.
                         // But we should stop the logic here.
                         return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isFocusing) {
            // Timer finished naturally logic needed here or in UI?
            // Ideally core logic is here. But rewards are in GamificationService. 
            // We can expose a "didComplete" flag or callback.
            // For architecture simplicity, we'll let the UI component (Gamification) 
            // watch 'timeLeft' and 'isFocusing' to trigger completion, then call 'stopFocus' here.
        }
        return () => clearInterval(interval);
    }, [isFocusing, timeLeft]);


    const startFocus = (minutes) => {
        const durationSec = minutes * 60;
        const endTime = Date.now() + (durationSec * 1000);
        
        localStorage.setItem('focus_end_time', endTime.toString());
        localStorage.setItem('focus_total_duration', durationSec.toString());
        
        setTotalDuration(durationSec);
        setTimeLeft(durationSec);
        setIsFocusing(true);

        // Req 2: Auto Enable Blocking
        if (setBlocking) {
            setBlocking(true);
        }
    };

    const stopFocus = () => {
        setIsFocusing(false);
        setTimeLeft(0);
        setTotalDuration(0);
        localStorage.removeItem('focus_end_time');
        localStorage.removeItem('focus_total_duration');
    };

    return (
        <FocusContext.Provider value={{ isFocusing, timeLeft, totalDuration, startFocus, stopFocus }}>
            {children}
        </FocusContext.Provider>
    );
};
