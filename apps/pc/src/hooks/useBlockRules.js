import { useState, useEffect } from "react";
import { collection, onSnapshot, writeBatch, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";
import { callRust } from "../services/tauri";

import { ruleSchema, ruleGroupSchema } from "@mindful-block/shared";

const validateAgainstSchema = (data, schema) => {
  if (!schema || !schema.properties) return true;
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null) {
        console.error(`Schema Validation Failed: Missing required field '${field}'`);
        return false;
      }
    }
  }
  return true;
};

export const useBlockRules = (user, setIsAdmin) => {
  const [rules, setRules] = useState([]);
  const [groups, setGroups] = useState([{ id: "general", name: "General", is_system: true }]);
  const [status, setStatus] = useState("Đang khởi tạo...");

  useEffect(() => {
    if (!user || !isCloudReady || !db) return;

    const rulesUnsub = onSnapshot(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRules(data);

      setStatus("Đang đồng bộ...");
      const formatted = data.map((r) => ({
        domain: r.domain,
        is_active: r.is_active,
      }));

      callRust("apply_blocking_rules", { rules: formatted })
        .then(() => setStatus("Bảo vệ đang bật"))
        .catch((err) => {
          if (String(err).includes("ADMIN")) setIsAdmin(false);
          setStatus("Lỗi hệ thống");
        });
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
  const addRule = async (newDomain, groupName = "General") => {
    if (!newDomain || !user) return { success: false, error: "Invalid input" };
    const cleanDomain = newDomain.toLowerCase().trim().replace("www.", "");
    const cleanGroup = groupName.trim();

    if (rules.some((r) => r.domain === cleanDomain)) {
      return { success: false, error: "Tên miền đã tồn tại." };
    }

    const newRuleData = {
      domain: cleanDomain,
      is_active: true,
      mode: "HARD",
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
        return { success: false, error: "Lỗi hệ thống." };
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
    deleteGroup, // Exporting new function
  };
};
