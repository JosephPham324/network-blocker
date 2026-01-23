import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Globe,
  Trash2,
  Power,
  ShieldCheck,
  ShieldOff,
  CheckSquare,
  Square,
  X,
  FolderInput,
  Folder,
  Layers,
  ChevronDown,
  AlertTriangle,
  Upload,
  Search,
  ShieldAlert,
} from "lucide-react";
import FrictionModal from "./FrictionModal";
import { translations } from "../locales";
import { BLOCK_PRESETS, SAMPLE_CSV_CONTENT } from "../constants/presets";
import { Download, BookOpen } from "lucide-react";
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

const BlockList = ({ rules, groups = [], onAdd, onDelete, onToggle, onBatchDelete, onBatchToggle, onBatchMove, onDeleteGroup, onImport, onUpdateMode, language = "vi" }) => {
  const t = translations[language].blocklist;
  const tf = translations[language].friction;
  const [newDomain, setNewDomain] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState("General");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  // State for Group Selector UI
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // State for "Move to Group" UI
  const [isMoving, setIsMoving] = useState(false);
  const [targetGroup, setTargetGroup] = useState("");

  // State for Delete Confirmation Modal
  const [groupToDelete, setGroupToDelete] = useState(null);

  // State for Friction Modal
  const [frictionState, setFrictionState] = useState({
      isOpen: false,
      data: null, // { type: 'rule_toggle', id: '..', domain: '..', currentStatus: true } etc
  });
  const [previewPreset, setPreviewPreset] = useState(null);

  const closeFriction = () => setFrictionState({ ...frictionState, isOpen: false, data: null });

  // --- DERIVED STATE ---

  const allKnownGroups = useMemo(() => {
    const uniqueGroups = new Map();
    groups.forEach((g) => uniqueGroups.set(g.name, g));
    rules.forEach((r) => {
      const gName = r.group || "General";
      if (!uniqueGroups.has(gName)) {
        uniqueGroups.set(gName, { id: gName, name: gName });
      }
    });
    return Array.from(uniqueGroups.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [groups, rules]);

  const groupedRules = useMemo(() => {
    const result = {};
    allKnownGroups.forEach((g) => {
      result[g.name] = [];
    });

    const filteredRules = rules.filter((r) => 
        r.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredRules.forEach((rule) => {
      const gName = rule.group || "General";
      if (!result[gName]) {
        result[gName] = [];
      }
      result[gName].push(rule);
    });
    return result;
  }, [rules, allKnownGroups, searchTerm]);

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

  // Trigger Modal
  const handleDeleteGroupClick = (groupName) => {
    setGroupToDelete(groupName);
  };

  // Actual Delete Action
  const confirmDeleteGroup = () => {
     // This is now handled by Friction Modal logic or we can keep it if we want to replace it entirely.
     // The prompt says "Disable a group", but deleting a group is also a critical action.
     // I'll replace the simple AlertTriangle modal with the FrictionModal for deletion too, 
     // or keep it simple if the user only asked for "Disable a group" to have friction.
     // User request: "Disable a group", "Delete a rule".
     // User ALSO said: "Maybe let them type out a confirmation ... like 'Tôi xác nhận xoá luật chặn xxx.com'"
     // It makes sense to unify this.
     
     // For now, I'll hook into the existing friction system I'm building.
     // But wait, the existing code has `groupToDelete` state. I should probably replace that with my new system 
     // to be consistent, OR just add the friction to the "Disable" part.
     // The request says: "Disable individual rules", "Disable a group", "Delete a rule".
     // It DOES NOT explicitly say "Delete a group", but that is a super dangerous action, so I'll add friction there too.
    if (groupToDelete) {
      onDeleteGroup(groupToDelete);
      setGroupToDelete(null);
    }
  };

  const handleApplyFriction = () => {
    const { data } = frictionState;
    if (!data) return;

    if (data.type === 'rule_toggle') {
        onToggle(data.id, data.currentStatus);
    } else if (data.type === 'rule_delete') {
        onDelete(data.id);
    } else if (data.type === 'group_toggle') {
        onBatchToggle(data.ids, false); // Turning OFF
    } else if (data.type === 'group_delete') {
        onDeleteGroup(data.groupName);
    }
    closeFriction();
  };

  // --- INTERCEPTORS ---

  // 1. Toggle Rule (Intercept specific)
  const handleToggleRuleClick = (id, currentStatus, domain) => {
    if (currentStatus) {
        // Turning OFF -> Friction
        setFrictionState({
            isOpen: true,
            data: { type: 'rule_toggle', id, currentStatus, domain },
        });
    } else {
        // Turning ON -> No Friction
        onToggle(id, currentStatus);
    }
  };

  // 2. Delete Rule (Intercept always)
  const handleDeleteRuleClick = (id, domain) => {
    setFrictionState({
        isOpen: true,
        data: { type: 'rule_delete', id, domain },
    });
  };

  // 3. Toggle Group (Intercept if turning OFF)
  const handleToggleGroupClick = (groupName, targetStatus) => {
    // If targetStatus is FALSE (we are turning it OFF because it was active), show friction
    // If targetStatus is TRUE (we are turning it ON), no friction
    if (!targetStatus) {
         const idsInGroup = groupedRules[groupName]?.map((r) => r.id) || [];
         setFrictionState({
            isOpen: true,
            data: { type: 'group_toggle', groupName, ids: idsInGroup },
         });
    } else {
        handleToggleGroup(groupName, targetStatus);
    }
  };
  
  // 4. Delete Group (Replace existing modal logic with Friction)
  const handleDeleteGroupClickNew = (groupName) => {
     setFrictionState({
        isOpen: true,
        data: { type: 'group_delete', groupName },
     });
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      // Basic CSV parsing
      const headers = lines[0].split(",").map(h => h.trim());
      // Expecting Domain, Group, (Mode)
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Handle basic CSV: split by comma, remove quotes if present
        const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        
        // Map values to headers
        const entry = {};
        headers.forEach((h, index) => {
            if (values[index]) entry[h] = values[index];
        });
        
        if (entry.Domain) {
            data.push(entry);
        }
      }

      if (data.length > 0) {
        const result = await onImport(data);
        if (result.success) {
            // Optional: Show success toast or reset
            if (result.count > 0) alert(`Imported ${result.count} rules successfully!`);
            else alert("Import completed but no new rules were added (duplicates skipped).");
        } else {
            setError(result.error);
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = null;
  };

  const filteredGroups = allKnownGroups.filter((g) => g.name.toLowerCase().includes(newGroup.toLowerCase()));

  return (
    <div className="max-w-full space-y-8 animate-in fade-in duration-500 pb-32 relative">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-5xl font-serif font-bold text-[#354F52] tracking-tight">{t.title}</h2>
           <p className="text-slate-400 mt-2 text-lg">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.search_placeholder} 
                    className="pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all w-48 focus:w-64"
                />
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

             {/* Presets Dropdown */}
             <div className="relative group/presets">
                <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium">
                    <BookOpen size={20} />
                    <span>{t.presets_btn}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible opacity-0 group-hover/presets:visible group-hover/presets:opacity-100 transition-all z-50 transform origin-top-right">
                    <div className="text-xs font-bold text-slate-300 uppercase px-3 py-2">{t.presets_quick_import}</div>
                    {BLOCK_PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => setPreviewPreset(preset)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <div className="font-bold text-[#354F52]">{preset.name}</div>
                            <div className="text-xs text-slate-400">{preset.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
            >
                <Upload size={20} />
                <span>{t.import_csv}</span>
            </button>
        </div>
      </header>

      {/* --- INPUT FORM --- */}
      <div className="space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-3 z-20 relative">
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
              placeholder={t.domain_placeholder}
              className={`w-full pl-14 pr-4 py-6 rounded-[32px] bg-white border-2 shadow-sm focus:ring-4 outline-none text-xl font-medium transition-all ${
                error
                  ? "border-red-100 focus:border-red-300 text-red-600 placeholder:text-red-300"
                  : "border-transparent focus:border-primary/10 text-[#2F3E46]"
              }`}
            />
          </div>

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
                placeholder={t.group_placeholder}
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
            {showGroupDropdown && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden py-2 animate-in slide-in-from-top-2 fade-in z-50 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">{t.select_or_create}</div>
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
                {filteredGroups.length === 0 && (
                  <div className="px-5 py-3 text-slate-400 italic text-sm">{newGroup ? t.create_group.replace("{group}", newGroup) : t.no_group}</div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-8 rounded-[32px] font-bold hover:shadow-lg transition-all active:scale-95 shadow-primary/20 text-lg whitespace-nowrap"
          >
            {t.add_button}
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
            const anyInGroupActive = groupRules.length > 0 && groupRules.some((r) => r.is_active);

            const groupObj = allKnownGroups.find((g) => g.name === groupName);
            const isSystemGroup = groupObj?.is_system || groupName === "General";

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

                  <div className="flex items-center gap-3">
                    {/* Delete Group Button */}
                    {!isSystemGroup && (
                      <button
                        onClick={() => handleDeleteGroupClickNew(groupName)}
                        className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa nhóm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {/* Group Toggle Button */}
                    {groupRules.length > 0 && (
                      <button
                        onClick={() => handleToggleGroupClick(groupName, !anyInGroupActive)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${anyInGroupActive ? "bg-emerald-500" : "bg-slate-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                            anyInGroupActive ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Group Rules List */}
                <div className="grid gap-3">
                  {groupRules.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-[24px] text-center text-slate-300 italic text-sm">
                      {t.empty_group}
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
                              {/* Mode Badge - Clickable */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newMode = (r.mode === 'friction' || r.mode === 'FRICTION') ? 'hard' : 'friction';
                                  onUpdateMode(r.id, newMode);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 ${
                                  (r.mode === 'friction' || r.mode === 'FRICTION') 
                                    ? 'bg-blue-500 text-white shadow-blue-200 hover:bg-blue-600' 
                                    : 'bg-red-500 text-white shadow-red-200 hover:bg-red-600'
                                }`}
                                title="Click to change mode"
                              >
                                  {(r.mode === 'friction' || r.mode === 'FRICTION') ? <Layers size={12} /> : <ShieldAlert size={12} />}
                                  {(r.mode === 'friction' || r.mode === 'FRICTION') ? tf.mode_friction : tf.mode_hard}
                              </button>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleToggleRuleClick(r.id, r.is_active, r.domain)}
                                className={`p-2 rounded-xl ${r.is_active ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:bg-slate-100"}`}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRuleClick(r.id, r.domain)}
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
          <p className="text-slate-300 italic font-bold">{t.no_data}</p>
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
            <span className="font-bold text-sm whitespace-nowrap">{t.items_count.replace("{count}", selectedIds.length)}</span>
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
              placeholder={t.move_group_placeholder}
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm font-medium w-40"
            />
            <button type="submit" className="bg-white text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-100">
              {t.save}
            </button>
            <button type="button" onClick={() => setIsMoving(false)} className="p-1.5 hover:bg-white/10 rounded-full">
              <X size={14} />
            </button>
          </form>
        )}
      </div>

      {/* --- FRICTION MODAL --- */}
      <FrictionModal
        isOpen={frictionState.isOpen}
        onClose={closeFriction}
        onConfirm={handleApplyFriction}
        title={
            frictionState.data?.type === 'rule_delete' ? `Xóa chặn ${frictionState.data?.domain}?` :
            frictionState.data?.type === 'group_delete' ? `Xóa nhóm ${frictionState.data?.groupName}?` :
            frictionState.data?.type === 'group_toggle' ? `Tắt nhóm ${frictionState.data?.groupName}?` :
            "Tắt chặn tên miền?"
        }
        message={
            frictionState.data?.type === 'rule_delete' ? "Hành động này sẽ xóa tên miền khỏi danh sách chặn." :
            frictionState.data?.type === 'group_delete' ? "Hành động này sẽ xóa toàn bộ nhóm và các quy tắc bên trong." :
            "Bạn sẽ có thể truy cập lại vào tên miền này."
        }
        confirmationText={
            frictionState.data?.type === 'rule_delete' ? `Tôi xác nhận xoá luật chặn ${frictionState.data?.domain}` :
            frictionState.data?.type === 'group_delete' ? `Tôi xác nhận xoá nhóm ${frictionState.data?.groupName}` :
            frictionState.data?.type === 'group_toggle' ? `Tôi xác nhận tắt nhóm ${frictionState.data?.groupName}` :
            `Tôi xác nhận tắt luật chặn ${frictionState.data?.domain}`
        }
        actionType={frictionState.data?.type?.includes('delete') ? "delete" : "disable"}
        language={language}
      />

      {/* --- PRESET PREVIEW MODAL --- */}
      {previewPreset && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 pb-0">
                      <h3 className="text-2xl font-serif font-bold text-[#354F52]">
                          {t.preview_title.replace("{name}", previewPreset.name)}
                      </h3>
                      <p className="text-slate-400 mt-1">{previewPreset.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                          <span>{t.preview_count.replace("{count}", previewPreset.rules.length)}</span>
                      </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto p-4 pt-2 space-y-2">
                      {previewPreset.rules.map((rule, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                               <span className="font-bold text-[#354F52]">{rule.domain}</span>
                               <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">{rule.group}</span>
                          </div>
                      ))}
                  </div>
                  
                  <div className="p-6 pt-2 flex gap-3">
                      <button 
                          onClick={async () => {
                            const csvHeader = "Domain,Group,Mode\n";
                            const csvRows = previewPreset.rules.map(r => `${r.domain},${r.group},${r.mode || 'HARD'}`).join("\n");
                            const content = csvHeader + csvRows;

                            try {
                                // Try Native Save
                                const path = await save({
                                    filters: [{
                                        name: 'CSV',
                                        extensions: ['csv']
                                    }],
                                    defaultPath: `${previewPreset.id}_preset.csv`
                                });

                                if (path) {
                                    await writeTextFile(path, content);
                                    // Optional: Notify success?
                                }
                            } catch (e) {
                                console.warn("Native save failed, falling back to browser download:", e);
                                // Fallback for Browser / Permission Error
                                const blob = new Blob([content], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${previewPreset.id}_preset.csv`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                            }
                          }}
                          className="p-3 rounded-full font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                          title={t.download_sample}
                      >
                          <Download size={20} />
                      </button>
                      <button 
                          onClick={() => setPreviewPreset(null)}
                          className="flex-1 py-3 rounded-full font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                      >
                          {t.cancel}
                      </button>
                      <button 
                          onClick={() => {
                              onImport(previewPreset.rules);
                              setPreviewPreset(null);
                          }}
                          className="flex-1 py-3 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                          {t.import_action}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BlockList;
