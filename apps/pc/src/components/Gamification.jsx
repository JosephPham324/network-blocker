import React, { useState, useEffect } from 'react';
import { GamificationService } from '../services/GamificationService';
import { useFocus } from '../context/FocusContext';
import { translations } from "../locales"; // <--- Import // <--- Import

// --- Sub-Components ---

const DigitalGarden = ({ trees, t, language }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6">
      <h3 className="text-xl font-serif font-bold text-[#354F52] mb-4 flex items-center gap-2">
        <span className="text-2xl">🌱</span> {t.garden_title}
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 min-h-[150px] bg-[#F4F1EA] p-4 rounded-xl inner-shadow">
        {trees.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-[#5C6B73] opacity-60">
                <span className="text-4xl mb-2">🍂</span>
                <p>{t.garden_empty}</p>
            </div>
        )}
        {trees.map((tree, idx) => (
          <div key={idx} className="flex flex-col items-center animate-bounce-in">
            <span className="text-4xl drop-shadow-md">
                {tree.type === 'sprout' ? '🌱' : tree.type === 'pine' ? '🌲' : '🌳'}
            </span>
            <span className="text-[10px] text-[#5C6B73] mt-1" title={new Date(tree.plantedAt).toLocaleString()}>
                {new Date(tree.plantedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {month: 'short', day: 'numeric'})}
                <br />
                {new Date(tree.plantedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StreakCalendar = ({ streak, t, language }) => {
  // Get current month's calendar grid
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // First day of month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Create calendar grid (including empty cells for alignment)
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const isActive = streak.history && streak.history[dateStr];
    const isToday = date.toDateString() === today.toDateString();
    
    calendarDays.push({ day, date, dateStr, isActive, isToday });
  }
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6">
       <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif font-bold text-[#354F52] flex items-center gap-2">
                <span className="text-2xl">🔥</span> {t.streak_title}
            </h3>
            <div className="text-right">
                <span className="text-3xl font-bold text-[#E29578]">{streak.current}</span>
                <span className="text-xs text-[#5C6B73] uppercase tracking-wide ml-2">{t.streak_unit}</span>
            </div>
       </div>
       
       {/* Month/Year Header */}
       <div className="text-center mb-3 text-sm font-bold text-[#354F52]">
           {firstDay.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })}
       </div>
       
       {/* Day of week headers */}
       <div className="grid grid-cols-7 gap-1 mb-2">
           {(language === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((dayName, i) => (
               <div key={i} className="text-center text-[10px] font-bold text-[#5C6B73] uppercase">
                   {dayName}
               </div>
           ))}
       </div>
       
       {/* Calendar Grid */}
       <div className="grid grid-cols-7 gap-1">
           {calendarDays.map((dayData, i) => {
               if (!dayData) {
                   // Empty cell
                   return <div key={`empty-${i}`} className="aspect-square"></div>;
               }
               
               const { day, isActive, isToday } = dayData;
               
               return (
                   <div 
                       key={i} 
                       className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all
                           ${
                               isActive 
                                   ? 'bg-[#52796F] text-white shadow-sm' 
                                   : isToday
                                       ? 'bg-[#EBE7DE] text-[#354F52] ring-2 ring-[#E29578]'
                                       : 'bg-[#F4F1EA] text-[#5C6B73]'
                           }
                       `}
                   >
                       {day}
                   </div>
               );
           })}
       </div>
    </div>
  );
};

const TokenShop = ({ balance, onPurchase, t }) => {
    // Items are hardcoded for now, ideally they should be in locale or fetched
    const items = [
        { id: 'break_10', name: '10 Phút giải lao', icon: '☕', cost: 50 }, // Requires deeper I18n
        { id: 'theme_dark', name: 'Giao diện Tối', icon: '🌙', cost: 200 },
        { id: 'donate', name: 'Quyên góp từ thiện', icon: '🎗️', cost: 500 },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-serif font-bold text-[#354F52] flex items-center gap-2">
                    <span className="text-2xl">🪙</span> {t.shop_title}
                </h3>
                <div className="bg-[#52796F] text-white px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                    <span>{balance}</span>
                    <span className="text-xs opacity-80">TOKENS</span>
                </div>
            </div>
            
            <div className="space-y-4">
                {items.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => onPurchase(item)}
                        disabled={balance < item.cost}
                        className={`w-full flex justify-between items-center p-4 rounded-xl border border-[#EBE7DE] transition-all
                            ${balance >= item.cost ? 'hover:bg-[#F4F1EA] hover:border-[#52796F] cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl bg-[#EBE7DE] w-10 h-10 flex items-center justify-center rounded-lg">{item.icon}</span>
                            <div className="text-left">
                                <div className="font-bold text-[#2F3E46]">{item.name}</div>
                                <div className="text-xs text-[#5C6B73]">{t.shop_buy_desc}</div>
                            </div>
                        </div>
                        <span className="font-bold text-[#52796F]">{item.cost} 🪙</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- Main Page Component ---

const Gamification = ({ language = 'vi' }) => {
  const t = translations[language].focus; // <--- Get Translations
  const [data, setData] = useState({
      balance: 0,
      trees: [],
      streak: { current: 0 }
  });

  // Init Data
  useEffect(() => {
    GamificationService.init();
    refreshData();
  }, []);

  const refreshData = () => {
    setData({
        balance: GamificationService.getBalance().balance,
        trees: GamificationService.getTrees(),
        streak: GamificationService.getStreak()
    });
  };

// --- Timer Component (Connected to Context) ---
    const FocusTimer = ({ onComplete }) => {
        const { isFocusing, timeLeft, totalDuration, startFocus, stopFocus } = useFocus();
        const [minutes, setMinutes] = useState(25);
        const [showInfo, setShowInfo] = useState(false);

        // ... (Effects unchanged)
        
        useEffect(() => {
            if (isFocusing && timeLeft === 0) {
                 // Timer finished!
                 onComplete(totalDuration / 60); // Pass minutes
                 stopFocus();
            }
        }, [isFocusing, timeLeft, totalDuration, stopFocus, onComplete]);

        const toggleTimer = () => {
            if (!isFocusing) {
                startFocus(minutes);
            } else {
                // Give up - only stop if confirmed
                // Use a variable to ensure the confirm result is properly evaluated before any state changes
                const userConfirmed = window.confirm(t.give_up_warning);
                if (userConfirmed) {
                    stopFocus();
                }
                // If userConfirmed is false, do nothing - timer continues
            }
        };

        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };
        
        const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

        return (
            <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6 flex flex-col items-center relative overflow-hidden">
                {isFocusing && (
                    <div className="absolute top-0 left-0 h-1 bg-[#52796F] transition-all duration-1000" style={{width: `${progress}%`}}></div>
                )}

                 <h3 className="text-xl font-serif font-bold text-[#354F52] mb-4 flex items-center gap-2">
                    <span className="text-2xl">⏳</span> {t.focus_session}
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="ml-auto text-[#5C6B73] hover:text-[#354F52] transition-colors"
                        title={t.info_title}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </button>
                </h3>
                
                {/* Info Modal */}
                {showInfo && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInfo(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-[#354F52]">{t.info_title}</h4>
                                <button 
                                    onClick={() => setShowInfo(false)}
                                    className="text-[#5C6B73] hover:text-[#354F52] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[#5C6B73] mb-3">{t.info_desc}</p>
                            <div className="space-y-2 text-[#2F3E46] mb-4">
                                <p>{t.info_point1}</p>
                                <p>{t.info_point2}</p>
                                <p>{t.info_point3}</p>
                                <p>{t.info_point4}</p>
                            </div>
                            <button 
                                onClick={() => setShowInfo(false)}
                                className="w-full bg-[#52796F] text-white py-2 rounded-lg font-bold hover:bg-[#354F52] transition-colors"
                            >
                                {t.info_close}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className={`text-6xl font-bold font-mono mb-6 transition-colors ${isFocusing ? 'text-[#E29578]' : 'text-[#354F52]'}`}>
                    {isFocusing ? formatTime(timeLeft) : formatTime(minutes * 60)}
                </div>

                {!isFocusing && (
                    <div className="flex gap-4 mb-6">
                        {[15, 25, 45, 60].map(m => (
                            <button 
                                key={m}
                                onClick={() => setMinutes(m)}
                                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${minutes === m ? 'bg-[#52796F] text-white' : 'bg-[#F4F1EA] text-[#5C6B73] hover:bg-[#EBE7DE]'}`}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                )}

                <button 
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full text-lg font-bold shadow-md transition-all active:scale-95 ${isFocusing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#354F52] text-white hover:bg-[#2F3E46]'}`}
                >
                    {isFocusing ? t.give_up : t.start_focus}
                </button>
                {isFocusing && <p className="text-xs text-[#E29578] mt-3 animate-pulse">{t.mode_active}</p>}
            </div>
        );
    };

    const handleTimerComplete = (duration) => {
        let treeType = 'sprout';
        let amount = 10;
        
        if (duration >= 25) { treeType = 'pine'; amount = 25; }
        if (duration >= 60) { treeType = 'oak'; amount = 60; }

        GamificationService.addTokens(amount, `Focus Session (${duration}m)`);
        GamificationService.plantTree(treeType);
        GamificationService.checkin(); // Daily streak
        refreshData();
        
        alert(t.session_complete.replace('{amount}', amount).replace('{treeType}', treeType));
    };

    const handlePurchase = (item) => {
        if (GamificationService.spendTokens(item.cost, item.name)) {
            alert(t.purchase_success.replace('{name}', item.name)); 
            refreshData();
        }
    };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
        <header className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#354F52] mb-2">{t.page_title}</h2>
            <p className="text-[#5C6B73]">{t.page_subtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <FocusTimer onComplete={handleTimerComplete} />
                <DigitalGarden trees={data.trees} t={t} language={language} />
                <StreakCalendar streak={data.streak} t={t} language={language} />
            </div>
            <div>
                <TokenShop balance={data.balance} onPurchase={handlePurchase} t={t} />
            </div>
        </div>
    </div>
  );
};

export default Gamification;
