import React, { useState, useMemo, useRef, useEffect } from "react";
import { Globe, Trash2, Power, ShieldCheck, ShieldOff, CheckSquare, Square, X, FolderInput, Folder, Layers, ChevronDown } from "lucide-react";

const BlockList = ({ rules, groups = [], onAdd, onDelete, onBatchDelete, onBatchToggle, onBatchMove }) => {
  const [newDomain, setNewDomain] = useState("");
  const [newGroup, setNewGroup] = useState("General");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // State for Group Selector UI
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // State for "Move to Group" UI
  const [isMoving, setIsMoving] = useState(false);
  const [targetGroup, setTargetGroup] = useState("");

  // --- DERIVED STATE ---

  // 1. Combined Groups: Merge explicit groups (from DB) with implicit groups (from Rules)
  // This ensures the dropdown matches the list view even if the groups collection is empty.
  const allKnownGroups = useMemo(() => {
    const uniqueGroups = new Map();

    // A. Add Explicit Groups
    groups.forEach((g) => uniqueGroups.set(g.name, g));

    // B. Add Implicit Groups from Rules
    rules.forEach((r) => {
      const gName = r.group || "General";
      if (!uniqueGroups.has(gName)) {
        uniqueGroups.set(gName, { id: gName, name: gName }); // Mock group object
      }
    });

    return Array.from(uniqueGroups.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [groups, rules]);

  // 2. Grouped Rules: Organize rules into sections
  const groupedRules = useMemo(() => {
    const result = {};

    // Initialize all known groups
    allKnownGroups.forEach((g) => {
      result[g.name] = [];
    });

    // Distribute rules
    rules.forEach((rule) => {
      const gName = rule.group || "General";
      // Safety check if allKnownGroups somehow missed it (unlikely with logic above)
      if (!result[gName]) {
        result[gName] = [];
      }
      result[gName].push(rule);
    });

    return result;
  }, [rules, allKnownGroups]);

  // Click Outside Handler for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGroupDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---

  const handleSelectGroup = (groupName) => {
    const idsInGroup = groupedRules[groupName]?.map((r) => r.id) || [];
    const allSelected = idsInGroup.length > 0 && idsInGroup.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !idsInGroup.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...idsInGroup])]);
    }
  };

  const handleToggleGroup = (groupName, targetStatus) => {
    const idsInGroup = groupedRules[groupName]?.map((r) => r.id) || [];
    if (idsInGroup.length > 0) {
      onBatchToggle(idsInGroup, targetStatus);
    }
  };

  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    if (!targetGroup.trim()) return;
    await onBatchMove(selectedIds, targetGroup.trim());
    setIsMoving(false);
    setTargetGroup("");
    setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((i) => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await onAdd(newDomain, newGroup || "General");
    if (result.success) {
      setNewDomain("");
      setShowGroupDropdown(false);
    } else {
      setError(result.error);
    }
  };

  // Filter dropdown items based on input
  const filteredGroups = allKnownGroups.filter((g) => g.name.toLowerCase().includes(newGroup.toLowerCase()));

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500 pb-32 relative">
      <header>
        <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">Danh sách chặn</h2>
        <p className="text-slate-400 mt-2 text-lg">Quản lý theo nhóm để tối ưu quy trình.</p>
      </header>

      {/* --- INPUT FORM --- */}
      <div className="space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-3 z-20 relative">
          {/* 1. Domain Input */}
          <div className="flex-[2] relative group">
            <Globe
              className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${
                error ? "text-red-400" : "text-slate-300 group-focus-within:text-primary"
              }`}
              size={20}
            />
            <input
              type="text"
              value={newDomain}
              onChange={(e) => {
                setNewDomain(e.target.value);
                setError("");
              }}
              placeholder="youtube.com..."
              className={`w-full pl-14 pr-4 py-6 rounded-[32px] bg-white border-2 shadow-sm focus:ring-4 outline-none text-xl font-medium transition-all ${
                error
                  ? "border-red-100 focus:border-red-300 text-red-600 placeholder:text-red-300"
                  : "border-transparent focus:border-primary/10 text-[#2F3E46]"
              }`}
            />
          </div>

          {/* 2. Custom Group Combobox */}
          <div className="flex-1 relative min-w-[160px]" ref={dropdownRef}>
            <div className="relative h-full">
              <Folder
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 peer-focus-within:text-secondary transition-colors pointer-events-none z-10"
                size={20}
              />

              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onFocus={() => setShowGroupDropdown(true)}
                placeholder="Nhóm..."
                className="w-full h-full pl-12 pr-10 py-6 rounded-[32px] bg-white border-2 border-transparent focus:border-secondary/20 shadow-sm focus:ring-4 focus:ring-secondary/10 outline-none text-lg font-medium text-[#354F52] placeholder:text-slate-300 peer"
              />

              <button
                type="button"
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary p-1"
              >
                <ChevronDown size={20} className={`transition-transform duration-200 ${showGroupDropdown ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showGroupDropdown && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden py-2 animate-in slide-in-from-top-2 fade-in z-50 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">Chọn hoặc nhập mới</div>

                {filteredGroups.map((group) => (
                  <button
                    key={group.id || group.name}
                    type="button"
                    onClick={() => {
                      setNewGroup(group.name);
                      setShowGroupDropdown(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 text-[#354F52] font-medium transition-colors flex items-center justify-between group"
                  >
                    <span>{group.name}</span>
                    {newGroup === group.name && <CheckSquare size={16} className="text-secondary" />}
                  </button>
                ))}

                {/* Empty State / Create New Hint */}
                {filteredGroups.length === 0 && (
                  <div className="px-5 py-3 text-slate-400 italic text-sm">{newGroup ? `Tạo nhóm mới "${newGroup}"` : "Chưa có nhóm nào"}</div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-8 rounded-[32px] font-bold hover:shadow-lg transition-all active:scale-95 shadow-primary/20 text-lg whitespace-nowrap"
          >
            Thêm
          </button>
        </form>

        {error && <div className="pl-6 text-sm font-bold text-red-500 animate-in slide-in-from-left-2">⚠️ {error}</div>}
      </div>

      {/* --- RENDER GROUPS --- */}
      <div className="space-y-8">
        {Object.entries(groupedRules)
          .sort()
          .map(([groupName, groupRules]) => {
            const allInGroupSelected = groupRules.length > 0 && groupRules.every((r) => selectedIds.includes(r.id));
            const allInGroupActive = groupRules.length > 0 && groupRules.every((r) => r.is_active);

            return (
              <div key={groupName} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectGroup(groupName)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                        allInGroupSelected ? "text-primary" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {allInGroupSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      <span className="text-lg text-[#354F52]">{groupName}</span>
                    </button>
                    <span className="bg-slate-100 text-slate-400 text-xs px-2 py-1 rounded-full font-bold">{groupRules.length}</span>
                  </div>
                  {groupRules.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleGroup(groupName, !allInGroupActive)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${allInGroupActive ? "bg-emerald-500" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                            allInGroupActive ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Group Rules List */}
                <div className="grid gap-3">
                  {groupRules.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-[24px] text-center text-slate-300 italic text-sm">
                      Chưa có tên miền nào trong nhóm này
                    </div>
                  ) : (
                    groupRules.map((r) => {
                      const isSelected = selectedIds.includes(r.id);
                      return (
                        <div
                          key={r.id}
                          onClick={() => handleSelectOne(r.id)}
                          className={`
                          relative p-4 rounded-[24px] border cursor-pointer select-none transition-all duration-200 group
                          ${
                            isSelected
                              ? "bg-[#EBE7DE] border-primary/20 shadow-md transform scale-[1.01]"
                              : r.is_active
                              ? "bg-white border-slate-100 hover:border-emerald-200"
                              : "bg-slate-50 border-transparent opacity-60 grayscale"
                          }
                        `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "bg-primary border-primary text-white" : "border-slate-200 bg-white"
                                }`}
                              >
                                {isSelected && <CheckSquare size={12} />}
                              </div>
                              <span className={`font-bold text-lg ${r.is_active ? "text-[#354F52]" : "text-slate-400 line-through"}`}>
                                {r.domain}
                              </span>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onToggle(r.id, r.is_active)}
                                className={`p-2 rounded-xl ${r.is_active ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:bg-slate-100"}`}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => onDelete(r.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {rules.length === 0 && Object.keys(groupedRules).length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100">
          <p className="text-slate-300 italic font-bold">Chưa có dữ liệu</p>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <div
        className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#354F52] text-white p-2 pl-6 rounded-[24px] shadow-2xl flex items-center gap-4 transition-all duration-300 z-50
        ${selectedIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}
      `}
      >
        {!isMoving ? (
          <>
            <span className="font-bold text-sm whitespace-nowrap">{selectedIds.length} mục</span>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-1">
              <button onClick={() => onBatchToggle(selectedIds, true)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <ShieldCheck size={18} className="text-emerald-400" />
              </button>
              <button onClick={() => onBatchToggle(selectedIds, false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <ShieldOff size={18} className="text-slate-400" />
              </button>
              <button
                onClick={() => setIsMoving(true)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-accent"
                title="Chuyển nhóm"
              >
                <FolderInput size={18} />
              </button>
              <button
                onClick={() => onBatchDelete(selectedIds)}
                className="p-3 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <button onClick={() => setSelectedIds([])} className="ml-2 p-2 bg-black/20 hover:bg-black/40 rounded-full">
              <X size={14} />
            </button>
          </>
        ) : (
          <form onSubmit={handleMoveSubmit} className="flex items-center gap-2 pr-2 animate-in fade-in">
            <Layers size={18} className="text-accent" />
            <input
              autoFocus
              type="text"
              placeholder="Nhập tên nhóm mới..."
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm font-medium w-40"
            />
            <button type="submit" className="bg-white text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-100">
              Lưu
            </button>
            <button type="button" onClick={() => setIsMoving(false)} className="p-1.5 hover:bg-white/10 rounded-full">
              <X size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlockList;
