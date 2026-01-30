import { useState, useEffect } from "react";
import { collection, onSnapshot, writeBatch, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";
import { callRust } from "../services/tauri";
import { translations } from "../locales"; 

import { ruleSchema, ruleGroupSchema, validateAgainstSchema } from "@mindful-block/shared";



export const useBlockRules = (user, setIsAdmin, blockingEnabled = true , language) => {
  const [rules, setRules] = useState([]);
  const [groups, setGroups] = useState([{ id: "general", name: "General", is_system: true }]);
  const currentLang = language;
  const t = translations[currentLang].system;
  const [status, setStatus] = useState(t.status_initializing);

  // Sync Rules with Rust whenever they change
  useEffect(() => {
    if (!rules) return;
    
    
    const formatted = rules.map((r) => ({
      domain: r.domain,
      is_active: r.is_active,
      mode: (r.mode || "hard").toLowerCase(), 
    }));

    // If blocking is disabled globally, send empty list to Rust to clear hosts
    const rulesToApply = blockingEnabled ? formatted : [];
    
    console.log(`[Sync] Applying Rules to Rust (Lang: ${language}):`, rulesToApply);

    callRust("apply_blocking_rules", { rules: rulesToApply, language: language })
    .then((res) => setStatus(t.status_protected.replace('{count}', res)))
    .catch((err) => {
        console.error("[Sync] Error:", err);
        if (String(err).includes("ADMIN")) setIsAdmin(false);
        setStatus(t.status_error);
    });
  }, [rules, setIsAdmin, blockingEnabled, language, t]);

  useEffect(() => {
    if (!user || !isCloudReady || !db) return;

    const rulesUnsub = onSnapshot(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRules(data);
      setStatus(t.status_syncing);
    });

    const groupsUnsub = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`), orderBy("name")), (snap) => {
      const groupData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const hasGeneral = groupData.some((g) => g.name === "General");
      const finalGroups = hasGeneral ? groupData : [{ id: "general", name: "General", is_system: true }, ...groupData];
      setGroups(finalGroups);
    });

    return () => {
      rulesUnsub();
      groupsUnsub();
    };
  }, [user, setIsAdmin]);

  // --- ADD RULE ---
  const addRule = async (newDomain, groupName = "General", mode = "hard") => {
    if (!newDomain || !user) return { success: false, error: "Invalid input" };
    const cleanDomain = newDomain.toLowerCase().trim().replace("www.", "");
    const cleanGroup = groupName.trim();

    if (rules.some((r) => r.domain === cleanDomain)) {
      return { success: false, error: t.error_domain_exists };
    }

    const newRuleData = {
      domain: cleanDomain,
      is_active: true,
      mode: mode.toLowerCase(), // Ensure lowercase
      group: cleanGroup,
      v: 1,
      updated_at: serverTimestamp(),
    };

    const newGroupData = {
      name: cleanGroup,
      is_system: false,
      created_at: serverTimestamp(),
    };

    if (!validateAgainstSchema(newRuleData, ruleSchema)) {
      return { success: false, error: "Invalid Rule Data (Schema Mismatch)" };
    }

    const groupExists = groups.some((g) => g.name.toLowerCase() === cleanGroup.toLowerCase());

    if (!groupExists && cleanGroup !== "General") {
      if (!validateAgainstSchema(newGroupData, ruleGroupSchema)) {
        return { success: false, error: "Invalid Group Data (Schema Mismatch)" };
      }
    }

    if (isCloudReady) {
      try {
        const batch = writeBatch(db);

        if (!groupExists && cleanGroup !== "General") {
          const newGroupRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`));
          batch.set(newGroupRef, newGroupData);
        }

        const newRuleRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`));
        batch.set(newRuleRef, newRuleData);

        await batch.commit();
        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false, error: t.error_system };
      }
    } else {
      setRules([
        ...rules,
        {
          id: Date.now().toString(),
          ...newRuleData,
          updated_at: new Date(),
        },
      ]);
      return { success: true };
    }
  };

  // --- DELETE GROUP ---
  const deleteGroup = async (groupName) => {
    if (!user || !groupName) return;
    const cleanGroup = groupName.trim();

    // Prevent deleting System/General groups
    if (cleanGroup.toLowerCase() === "general") return;
    const groupObj = groups.find((g) => g.name === cleanGroup);
    if (groupObj?.is_system) return;

    if (isCloudReady) {
      const batch = writeBatch(db);

      // 1. Delete all rules in this group
      const rulesInGroup = rules.filter((r) => r.group === cleanGroup);
      rulesInGroup.forEach((r) => {
        const ruleRef = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, r.id);
        batch.delete(ruleRef);
      });

      // 2. Delete the group document itself (if it exists)
      if (groupObj && groupObj.id) {
        const groupRef = doc(db, `artifacts/${appId}/users/${user.uid}/block_groups`, groupObj.id);
        batch.delete(groupRef);
      }

      await batch.commit();
    } else {
      // Mock Mode
      setRules(rules.filter((r) => r.group !== cleanGroup));
      setGroups(groups.filter((g) => g.name !== cleanGroup));
    }
  };

  const moveBatchToGroup = async (ids, newGroupName) => {
    if (!user || ids.length === 0) return;
    const cleanGroup = newGroupName.trim();
    const newGroupData = {
      name: cleanGroup,
      is_system: false,
      created_at: serverTimestamp(),
    };

    const groupExists = groups.some((g) => g.name.toLowerCase() === cleanGroup.toLowerCase());

    if (!groupExists && cleanGroup !== "General") {
      if (!validateAgainstSchema(newGroupData, ruleGroupSchema)) {
        console.error("Cannot move batch: Invalid Group Schema");
        return;
      }
    }

    if (isCloudReady) {
      const batch = writeBatch(db);
      if (!groupExists && cleanGroup !== "General") {
        const newGroupRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`));
        batch.set(newGroupRef, newGroupData);
      }
      ids.forEach((id) => {
        const ref = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id);
        batch.update(ref, { group: cleanGroup, updated_at: serverTimestamp() });
      });
      await batch.commit();
    }
  };

  const toggleBatch = async (ids, targetStatus) => {
    if (!user || ids.length === 0) return;
    if (isCloudReady) {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const ref = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id);
        batch.update(ref, { is_active: targetStatus, updated_at: serverTimestamp() });
      });
      await batch.commit();
    } else {
      setRules(rules.map((r) => (ids.includes(r.id) ? { ...r, is_active: targetStatus } : r)));
    }
  };

  const deleteBatch = async (ids) => {
    if (!user || ids.length === 0) return;
    if (isCloudReady) {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const ref = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id);
        batch.delete(ref);
      });
      await batch.commit();
    } else {
      setRules(rules.filter((r) => !ids.includes(r.id)));
    }
  };

  const updateRuleMode = async (id, newMode) => {
    if (!user || !id) return;
    if (isCloudReady) {
      const batch = writeBatch(db);
      const ref = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id);
      batch.update(ref, { mode: newMode, updated_at: serverTimestamp() });
      await batch.commit();
    } else {
      setRules(rules.map((r) => (r.id === id ? { ...r, mode: newMode } : r)));
    }
  };

  const importRules = async (rulesData) => {
    if (!user || !rulesData || rulesData.length === 0) return { success: false, error: "No data to import" };
    
    // 1. Process and Validate Data
    const validRules = [];
    const newGroupsMap = new Map(); // name -> groupData

    for (const item of rulesData) {
      const rawDomain = item.Domain || item.domain;
      const rawGroup = item.Group || item.group;
      const rawMode = item.Mode || item.mode;

      const domain = rawDomain?.toLowerCase().trim().replace("www.", "");
      const groupName = rawGroup?.trim() || "General";
      const mode = ["hard", "friction", "timed"].includes(rawMode?.toLowerCase()) 
        ? rawMode.toLowerCase() 
        : "hard";

      if (!domain) continue;

      // Check if rule already exists (skip duplicates)
      if (rules.some(r => r.domain === domain)) continue;
      // Check if already in our current batch to import
      if (validRules.some(r => r.domain === domain)) continue;

      validRules.push({
        domain,
        group: groupName,
        mode,
        is_active: true,
        v: 1,
        updated_at: serverTimestamp(),
      });

      // Prepare Group if it doesn't exist
      const groupExists = groups.some(g => g.name.toLowerCase() === groupName.toLowerCase());
      if (!groupExists && groupName !== "General" && !newGroupsMap.has(groupName.toLowerCase())) {
        newGroupsMap.set(groupName.toLowerCase(), {
          name: groupName,
          is_system: false,
          created_at: serverTimestamp(),
        });
      }
    }

    if (validRules.length === 0) return { success: true, message: "No new rules to import." };

    // 2. Commit to Firestore
    if (isCloudReady) {
      try {
        const batch = writeBatch(db);

        // Add New Groups
        for (const groupData of newGroupsMap.values()) {
             const newGroupRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`));
             batch.set(newGroupRef, groupData);
        }

        // Add New Rules
        for (const ruleData of validRules) {
             const newRuleRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`));
             batch.set(newRuleRef, ruleData);
        }

        await batch.commit();
        return { success: true, count: validRules.length };
      } catch (e) {
        console.error("Import Error:", e);
        return { success: false, error: "Import failed. See console." };
      }
    } else {
      // Mock Data Update
      const mockGroups = Array.from(newGroupsMap.values()).map(g => ({ ...g, id: `g-${Date.now()}-${Math.random()}` }));
      const mockRules = validRules.map(r => ({ ...r, id: `r-${Date.now()}-${Math.random()}`, updated_at: new Date() }));
      
      setGroups([...groups, ...mockGroups]);
      setRules([...rules, ...mockRules]);
      return { success: true, count: validRules.length };
    }
  };

  const toggleRule = (id, currentStatus) => toggleBatch([id], !currentStatus);
  const deleteRule = (id) => deleteBatch([id]);

  return {
    rules,
    groups,
    status,
    addRule,
    deleteRule,
    toggleRule,
    toggleBatch,
    deleteBatch,
    moveBatchToGroup,
    updateRuleMode,
    deleteGroup,
    importRules,
  };
};
