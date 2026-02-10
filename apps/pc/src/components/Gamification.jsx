import React, { useState, useEffect, useMemo } from 'react';
import { GamificationService, SHOP_PRICES } from '../services/GamificationService';
import { useFocus } from '../context/FocusContext';
import { translations } from "../locales";

// --- Utility ---
const formatCountdown = (expiresAt) => {
    const diff = Math.max(0, expiresAt - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

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
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
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
                {(streak.freezes || 0) > 0 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        🧊 {streak.freezes}
                    </span>
                )}
            </div>
       </div>
       
       <div className="text-center mb-3 text-sm font-bold text-[#354F52]">
           {firstDay.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })}
       </div>
       
       <div className="grid grid-cols-7 gap-1 mb-2">
           {(language === 'vi' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((dayName, i) => (
               <div key={i} className="text-center text-[10px] font-bold text-[#5C6B73] uppercase">
                   {dayName}
               </div>
           ))}
       </div>
       
       <div className="grid grid-cols-7 gap-1">
           {calendarDays.map((dayData, i) => {
               if (!dayData) {
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

// --- Active Buffs Display ---
const ActiveBuffs = ({ buffs, t }) => {
    const [, setTick] = useState(0);
    
    useEffect(() => {
        if (buffs.length === 0) return;
        const interval = setInterval(() => setTick(v => v + 1), 1000);
        return () => clearInterval(interval);
    }, [buffs.length]);

    const getBuffLabel = (buff) => {
        switch (buff.type) {
            case 'SITE_PASS': return t.buff_site_pass.replace('{target}', buff.target);
            case 'GROUP_PASS': return t.buff_group_pass.replace('{target}', buff.target);
            case 'FOCUS_BOOST': return t.buff_focus_boost;
            default: return buff.type;
        }
    };

    const getBuffIcon = (type) => {
        switch (type) {
            case 'SITE_PASS': return '🎫';
            case 'GROUP_PASS': return '📦';
            case 'FOCUS_BOOST': return '⚡';
            default: return '✨';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#EBE7DE] shadow-sm mb-6">
            <h3 className="text-lg font-serif font-bold text-[#354F52] mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span> {t.buff_active_title}
            </h3>
            {buffs.length === 0 ? (
                <p className="text-sm text-[#5C6B73] text-center py-4 opacity-60">{t.buff_none}</p>
            ) : (
                <div className="space-y-3">
                    {buffs.map(buff => (
                        <div key={buff.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{getBuffIcon(buff.type)}</span>
                                <div>
                                    <div className="font-bold text-sm text-[#2F3E46]">{getBuffLabel(buff)}</div>
                                    <div className="text-xs text-emerald-600 font-mono">
                                        {t.buff_expires.replace('{time}', formatCountdown(buff.expiresAt))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Pass Selection Modal ---
const PassSelectionModal = ({ isOpen, type, rules, groups, balance, onConfirm, onClose, t }) => {
    const [selected, setSelected] = useState(null);

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) setSelected(null);
    }, [isOpen]);

    if (!isOpen) return null;

    const isSiteMode = type === 'SITE_PASS';

    // Build selectable options
    const options = isSiteMode
        ? rules
            .filter(r => r.is_active)
            .map(r => ({
                id: r.domain,
                label: r.domain,
                cost: SHOP_PRICES.SITE_PASS_10M,
                meta: { domain: r.domain },
            }))
        : groups
            .map(g => {
                const siteCount = rules.filter(r => (r.group || 'General') === g.name && r.is_active).length;
                if (siteCount === 0) return null;
                return {
                    id: g.name,
                    label: `${g.name} (${siteCount} sites)`,
                    cost: SHOP_PRICES.GROUP_PASS_PER_SITE * siteCount,
                    meta: { groupName: g.name, siteCount },
                };
            }).filter(Boolean);

    const selectedOption = options.find(o => o.id === selected);
    const canAfford = selectedOption ? balance >= selectedOption.cost : false;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-[#354F52] flex items-center gap-2">
                        <span>{isSiteMode ? '🎫' : '📦'}</span>
                        {isSiteMode ? t.shop_site_pass_title : t.shop_group_pass_title}
                    </h4>
                    <button onClick={onClose} className="text-[#5C6B73] hover:text-[#354F52] transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-[#5C6B73] mb-4">
                    {isSiteMode ? t.shop_site_pass_desc : t.shop_group_pass_modal_desc}
                </p>

                {/* Selection List */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                    {options.length === 0 ? (
                        <p className="text-center text-[#5C6B73] py-8 opacity-60">{t.shop_no_items}</p>
                    ) : (
                        options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelected(opt.id)}
                                className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all text-left
                                    ${selected === opt.id
                                        ? 'border-[#52796F] bg-emerald-50 ring-2 ring-[#52796F]'
                                        : 'border-[#EBE7DE] hover:bg-[#F4F1EA]'
                                    }
                                    ${balance < opt.cost ? 'opacity-50' : ''}
                                `}
                            >
                                <span className="font-medium text-[#2F3E46] text-sm">{opt.label}</span>
                                <span className={`font-bold text-sm whitespace-nowrap ml-2 ${balance >= opt.cost ? 'text-[#52796F]' : 'text-red-400'}`}>
                                    {opt.cost} 🪙
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-2 border-t border-[#EBE7DE]">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border border-[#EBE7DE] text-[#5C6B73] font-bold hover:bg-[#F4F1EA] transition-colors"
                    >
                        {t.shop_cancel}
                    </button>
                    <button
                        onClick={() => selectedOption && onConfirm(type, selectedOption)}
                        disabled={!selected || !canAfford}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all
                            ${selected && canAfford
                                ? 'bg-[#52796F] text-white hover:bg-[#354F52] shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {selectedOption
                            ? `${t.shop_confirm} (${selectedOption.cost} 🪙)`
                            : t.shop_confirm
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Token Shop (Compact) ---
const TokenShop = ({ balance, rules, groups, streak, onOpenPassModal, onPurchasePowerUp, t }) => {
    const activeSiteCount = rules.filter(r => r.is_active).length;
    const activeGroupCount = groups.filter(g => {
        return rules.some(r => (r.group || 'General') === g.name && r.is_active);
    }).length;

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
            
            {/* Access Passes */}
            <h4 className="text-xs font-bold text-[#5C6B73] uppercase tracking-wider mb-3">{t.shop_section_passes}</h4>
            <div className="space-y-3 mb-6">
                {/* Site Pass Button */}
                <button
                    onClick={() => onOpenPassModal('SITE_PASS')}
                    disabled={activeSiteCount === 0}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border border-[#EBE7DE] transition-all
                        ${activeSiteCount > 0 ? 'hover:bg-[#F4F1EA] hover:border-[#52796F] cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-[#EBE7DE] w-10 h-10 flex items-center justify-center rounded-lg">🎫</span>
                        <div className="text-left">
                            <div className="font-bold text-[#2F3E46] text-sm">{t.shop_site_pass_btn}</div>
                            <div className="text-xs text-[#5C6B73]">{t.shop_site_pass_desc}</div>
                        </div>
                    </div>
                    <span className="font-bold text-[#52796F] whitespace-nowrap ml-2">{SHOP_PRICES.SITE_PASS_10M} 🪙</span>
                </button>

                {/* Group Pass Button */}
                <button
                    onClick={() => onOpenPassModal('GROUP_PASS')}
                    disabled={activeGroupCount === 0}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border border-[#EBE7DE] transition-all
                        ${activeGroupCount > 0 ? 'hover:bg-[#F4F1EA] hover:border-[#52796F] cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-[#EBE7DE] w-10 h-10 flex items-center justify-center rounded-lg">📦</span>
                        <div className="text-left">
                            <div className="font-bold text-[#2F3E46] text-sm">{t.shop_group_pass_btn}</div>
                            <div className="text-xs text-[#5C6B73]">{t.shop_group_pass_desc}</div>
                        </div>
                    </div>
                    <span className="font-bold text-[#52796F] whitespace-nowrap ml-2 text-xs">{SHOP_PRICES.GROUP_PASS_PER_SITE}🪙 × sites</span>
                </button>
            </div>

            {/* Power-ups */}
            <h4 className="text-xs font-bold text-[#5C6B73] uppercase tracking-wider mb-3">{t.shop_section_powerups}</h4>
            <div className="space-y-3">
                {/* Streak Freeze */}
                <button
                    onClick={() => onPurchasePowerUp('STREAK_FREEZE')}
                    disabled={balance < SHOP_PRICES.STREAK_FREEZE}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border border-[#EBE7DE] transition-all
                        ${balance >= SHOP_PRICES.STREAK_FREEZE ? 'hover:bg-[#F4F1EA] hover:border-[#52796F] cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-[#EBE7DE] w-10 h-10 flex items-center justify-center rounded-lg">🧊</span>
                        <div className="text-left">
                            <div className="font-bold text-[#2F3E46] text-sm">{t.shop_streak_freeze}</div>
                            <div className="text-xs text-[#5C6B73]">
                                {t.shop_streak_freeze_desc}
                                {(streak.freezes || 0) > 0 && <span className="ml-1 text-blue-500 font-bold">({t.shop_freezes_owned.replace('{count}', streak.freezes)})</span>}
                            </div>
                        </div>
                    </div>
                    <span className="font-bold text-[#52796F] whitespace-nowrap ml-2">{SHOP_PRICES.STREAK_FREEZE} 🪙</span>
                </button>

                {/* Focus Boost */}
                <button
                    onClick={() => onPurchasePowerUp('FOCUS_BOOST')}
                    disabled={balance < SHOP_PRICES.FOCUS_BOOST}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border border-[#EBE7DE] transition-all
                        ${balance >= SHOP_PRICES.FOCUS_BOOST ? 'hover:bg-[#F4F1EA] hover:border-[#52796F] cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-[#EBE7DE] w-10 h-10 flex items-center justify-center rounded-lg">⚡</span>
                        <div className="text-left">
                            <div className="font-bold text-[#2F3E46] text-sm">{t.shop_focus_boost}</div>
                            <div className="text-xs text-[#5C6B73]">{t.shop_focus_boost_desc}</div>
                        </div>
                    </div>
                    <span className="font-bold text-[#52796F] whitespace-nowrap ml-2">{SHOP_PRICES.FOCUS_BOOST} 🪙</span>
                </button>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const Gamification = ({ language = 'vi', rules = [], groups = [] }) => {
  const t = translations[language].focus;
  const [data, setData] = useState({
      balance: 0,
      trees: [],
      streak: { current: 0, freezes: 0 },
      activeBuffs: [],
  });
  const [passModal, setPassModal] = useState({ isOpen: false, type: null }); // 'SITE_PASS' | 'GROUP_PASS'

  useEffect(() => {
    GamificationService.init();
    refreshData();
  }, []);

  const refreshData = () => {
    setData({
        balance: GamificationService.getBalance().balance,
        trees: GamificationService.getTrees(),
        streak: GamificationService.getStreak(),
        activeBuffs: GamificationService.getActiveBuffs(),
    });
  };

  // Refresh active buffs periodically
  useEffect(() => {
    const interval = setInterval(() => {
        const activeBuffs = GamificationService.getActiveBuffs();
        setData(prev => ({ ...prev, activeBuffs }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Pass Modal Handlers ---
  const handleOpenPassModal = (type) => {
      setPassModal({ isOpen: true, type });
  };

  const handleConfirmPass = (type, option) => {
      let success = false;
      if (type === 'SITE_PASS') {
          success = GamificationService.buySitePass(option.meta.domain);
      } else if (type === 'GROUP_PASS') {
          success = GamificationService.buyGroupPass(option.meta.groupName, option.meta.siteCount);
      }
      if (success) {
          alert(t.purchase_success.replace('{name}', option.label));
          refreshData();
      }
      setPassModal({ isOpen: false, type: null });
  };

  const handlePurchasePowerUp = (type) => {
      let success = false;
      let name = '';
      if (type === 'STREAK_FREEZE') {
          success = GamificationService.buyStreakFreeze();
          name = t.shop_streak_freeze;
      } else if (type === 'FOCUS_BOOST') {
          success = GamificationService.buyFocusBoost();
          name = t.shop_focus_boost;
      }
      if (success) {
          alert(t.purchase_success.replace('{name}', name));
          refreshData();
      }
  };

// --- Timer Component (Connected to Context) ---
    const FocusTimer = ({ onComplete }) => {
        const { isFocusing, timeLeft, totalDuration, startFocus, stopFocus } = useFocus();
        const [minutes, setMinutes] = useState(25);
        const [showInfo, setShowInfo] = useState(false);
        
        useEffect(() => {
            if (isFocusing && timeLeft === 0) {
                 onComplete(totalDuration / 60);
                 stopFocus();
            }
        }, [isFocusing, timeLeft, totalDuration, stopFocus, onComplete]);

        const toggleTimer = () => {
            if (!isFocusing) {
                startFocus(minutes);
            } else {
                const userConfirmed = window.confirm(t.give_up_warning);
                if (userConfirmed) {
                    stopFocus();
                }
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

        // Check for Focus Boost
        const boosted = GamificationService.consumeFocusBoost();
        if (boosted) {
            amount *= 2;
        }

        GamificationService.addTokens(amount, `Focus Session (${duration}m)${boosted ? ' [BOOSTED x2]' : ''}`);
        GamificationService.plantTree(treeType);
        GamificationService.checkin();
        refreshData();
        
        const msg = boosted 
            ? `⚡ BOOSTED! ${t.session_complete.replace('{amount}', amount).replace('{treeType}', treeType)}`
            : t.session_complete.replace('{amount}', amount).replace('{treeType}', treeType);
        alert(msg);
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
                <ActiveBuffs buffs={data.activeBuffs} t={t} />
                <DigitalGarden trees={data.trees} t={t} language={language} />
                <StreakCalendar streak={data.streak} t={t} language={language} />
            </div>
            <div>
                <TokenShop 
                    balance={data.balance} 
                    rules={rules} 
                    groups={groups}
                    streak={data.streak}
                    onOpenPassModal={handleOpenPassModal}
                    onPurchasePowerUp={handlePurchasePowerUp}
                    t={t} 
                />
            </div>
        </div>

        {/* Pass Selection Modal */}
        <PassSelectionModal
            isOpen={passModal.isOpen}
            type={passModal.type}
            rules={rules}
            groups={groups}
            balance={data.balance}
            onConfirm={handleConfirmPass}
            onClose={() => setPassModal({ isOpen: false, type: null })}
            t={t}
        />
    </div>
  );
};

export default Gamification;
