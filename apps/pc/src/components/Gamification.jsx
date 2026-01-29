import React, { useState, useEffect } from 'react';
import { GamificationService } from '../services/GamificationService';

// --- Sub-Components ---

const DigitalGarden = ({ trees }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6">
      <h3 className="text-xl font-serif font-bold text-[#354F52] mb-4 flex items-center gap-2">
        <span className="text-2xl">🌱</span> Digital Garden
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 min-h-[150px] bg-[#F4F1EA] p-4 rounded-xl inner-shadow">
        {trees.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-[#5C6B73] opacity-60">
                <span className="text-4xl mb-2">🍂</span>
                <p>Khu vườn trống trải. Hãy tập trung để trồng cây!</p>
            </div>
        )}
        {trees.map((tree, idx) => (
          <div key={idx} className="flex flex-col items-center animate-bounce-in">
            <span className="text-4xl drop-shadow-md">
                {tree.type === 'sprout' ? '🌱' : tree.type === 'pine' ? '🌲' : '🌳'}
            </span>
            <span className="text-[10px] text-[#5C6B73] mt-1">
                {new Date(tree.plantedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StreakCalendar = ({ streak }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6">
       <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif font-bold text-[#354F52] flex items-center gap-2">
                <span className="text-2xl">🔥</span> Streak Power
            </h3>
            <div className="text-right">
                <span className="text-3xl font-bold text-[#E29578]">{streak.current}</span>
                <span className="text-xs text-[#5C6B73] uppercase tracking-wide ml-2">Ngày liên tiếp</span>
            </div>
       </div>
       <div className="flex gap-2">
           {[...Array(7)].map((_, i) => {
               const day = new Date();
               day.setDate(day.getDate() - (6 - i));
               const dateStr = day.toISOString().split('T')[0];
               const isActive = streak.history && streak.history[dateStr];
               
               return (
                   <div key={i} className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center border-2 border-transparent ${isActive ? 'bg-[#52796F] text-white' : 'bg-[#F4F1EA] text-[#5C6B73]'}`}>
                       <span className="text-[10px] uppercase font-bold">{day.toLocaleDateString('vi-VN', {weekday: 'short'})}</span>
                       <span className="text-sm font-bold">{isActive ? '✓' : ''}</span>
                   </div>
               )
           })}
       </div>
    </div>
  );
};

const TokenShop = ({ balance, onPurchase }) => {
    const items = [
        { id: 'break_10', name: '10 Phút giải lao', icon: '☕', cost: 50 },
        { id: 'theme_dark', name: 'Giao diện Tối', icon: '🌙', cost: 200 },
        { id: 'donate', name: 'Quyên góp từ thiện', icon: '🎗️', cost: 500 },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-serif font-bold text-[#354F52] flex items-center gap-2">
                    <span className="text-2xl">🪙</span> Cửa hàng Token
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
                                <div className="text-xs text-[#5C6B73]">Mua bằng token</div>
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

const Gamification = ({ language }) => {
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

// --- Timer Component ---
    const FocusTimer = ({ onComplete }) => {
        const [minutes, setMinutes] = useState(25);
        const [timeLeft, setTimeLeft] = useState(25 * 60);
        const [isActive, setIsActive] = useState(false);

        useEffect(() => {
            let interval = null;
            if (isActive && timeLeft > 0) {
                interval = setInterval(() => {
                    setTimeLeft(timeLeft - 1);
                }, 1000);
            } else if (timeLeft === 0 && isActive) {
                setIsActive(false);
                onComplete(minutes);
            }
            return () => clearInterval(interval);
        }, [isActive, timeLeft, minutes, onComplete]);

        const toggleTimer = () => {
            if (!isActive) {
                setTimeLeft(minutes * 60);
                setIsActive(true);
            } else {
                setIsActive(false);
            }
        };

        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        return (
            <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6 flex flex-col items-center">
                 <h3 className="text-xl font-serif font-bold text-[#354F52] mb-4 flex items-center gap-2">
                    <span className="text-2xl">⏳</span> Focus Session
                </h3>
                
                <div className="text-6xl font-bold text-[#354F52] font-mono mb-6">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex gap-4 mb-6">
                    {[15, 25, 45, 60].map(m => (
                        <button 
                            key={m}
                            onClick={() => { setMinutes(m); setTimeLeft(m * 60); setIsActive(false); }}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${minutes === m ? 'bg-[#52796F] text-white' : 'bg-[#F4F1EA] text-[#5C6B73] hover:bg-[#EBE7DE]'}`}
                            disabled={isActive}
                        >
                            {m}m
                        </button>
                    ))}
                </div>

                <button 
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full text-lg font-bold shadow-md transition-all active:scale-95 ${isActive ? 'bg-[#E29578] text-white' : 'bg-[#354F52] text-white'}`}
                >
                    {isActive ? 'Give Up' : 'Start Focus'}
                </button>
                {isActive && <p className="text-xs text-[#E29578] mt-3 animate-pulse">Stay focused! Planting a tree...</p>}
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
        
        // Simple alert for now - could be a nice modal later
        alert(`Session Complete! You earned ${amount} tokens and planted a ${treeType}.`);
    };

    const handlePurchase = (item) => {
        if (GamificationService.spendTokens(item.cost, item.name)) {
            alert(`Bạn đã mua: ${item.name}`); 
            refreshData();
        }
    };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
        <header className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#354F52] mb-2">Thói quen & Phần thưởng</h2>
            <p className="text-[#5C6B73]">Nuôi dưỡng khu vườn tâm trí của bạn.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <FocusTimer onComplete={handleTimerComplete} />
                <DigitalGarden trees={data.trees} />
                <StreakCalendar streak={data.streak} />
            </div>
            <div>
                <TokenShop balance={data.balance} onPurchase={handlePurchase} />
            </div>
        </div>
    </div>
  );
};

export default Gamification;
