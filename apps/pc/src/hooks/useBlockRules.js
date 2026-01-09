import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, writeBatch, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";
import { callRust } from "../services/tauri";

export const useBlockRules = (user, setIsAdmin) => {
  const [rules, setRules] = useState([]);
  const [groups, setGroups] = useState([{ id: "general", name: "General", is_system: true }]); // Default
  const [status, setStatus] = useState("Đang khởi tạo...");

  // Sync Rules from Firestore & Apply to Rust
  useEffect(() => {
    if (!user || !isCloudReady || !db) return;

    // Listen to Rules
    const rulesUnsub = onSnapshot(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRules(data);

      // Rust Sync Logic
      setStatus("Đang đồng bộ...");
      const formatted = data.map((r) => ({ domain: r.domain, is_active: r.is_active }));
      callRust("apply_blocking_rules", { rules: formatted })
        .then(() => setStatus("Bảo vệ đang bật"))
        .catch((err) => {
          if (String(err).includes("ADMIN")) setIsAdmin(false);
          setStatus("Lỗi hệ thống");
        });
    });

    // Listen to Groups
    const groupsUnsub = onSnapshot(query(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`), orderBy("name")), (snap) => {
      const groupData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Always ensure 'General' exists in the list for UI
      const hasGeneral = groupData.some((g) => g.name === "General");
      const finalGroups = hasGeneral ? groupData : [{ id: "general", name: "General", is_system: true }, ...groupData];
      setGroups(finalGroups);
    });

    return () => {
      rulesUnsub();
      groupsUnsub();
    };
  }, [user, setIsAdmin]);

  const addRule = async (newDomain, groupName = "General") => {
    if (!newDomain || !user) return { success: false, error: "Invalid input" };
    const cleanDomain = newDomain.toLowerCase().trim().replace("www.", "");
    const cleanGroup = groupName.trim();

    // Check Duplicate Domain
    if (rules.some((r) => r.domain === cleanDomain)) {
      return { success: false, error: "Tên miền đã tồn tại." };
    }

    if (isCloudReady) {
      try {
        const batch = writeBatch(db);

        // A. Handle Group Creation (if it doesn't exist)
        const groupExists = groups.some((g) => g.name.toLowerCase() === cleanGroup.toLowerCase());
        let finalGroupName = cleanGroup;

        if (!groupExists && cleanGroup !== "General") {
          const newGroupRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`));
          batch.set(newGroupRef, {
            name: cleanGroup,
            created_at: serverTimestamp(),
          });
        }

        // B. Add Rule
        const newRuleRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`));
        batch.set(newRuleRef, {
          domain: cleanDomain,
          is_active: true,
          mode: "HARD",
          group: finalGroupName, // Storing Name is easier for display, ID is cleaner for DB. Let's use Name for simplicity now.
          v: 1,
          updated_at: serverTimestamp(),
        });

        await batch.commit();
        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false, error: "Lỗi hệ thống." };
      }
    } else {
      // Mock
      setRules([...rules, { id: Date.now().toString(), domain: cleanDomain, group: cleanGroup, is_active: true }]);
      return { success: true };
    }
  };

  const moveBatchToGroup = async (ids, newGroupName) => {
    if (!user || ids.length === 0) return;
    const cleanGroup = newGroupName.trim();

    if (isCloudReady) {
      const batch = writeBatch(db);

      // Create group if missing
      const groupExists = groups.some((g) => g.name.toLowerCase() === cleanGroup.toLowerCase());
      if (!groupExists && cleanGroup !== "General") {
        const newGroupRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/block_groups`));
        batch.set(newGroupRef, { name: cleanGroup, created_at: serverTimestamp() });
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

  return { rules, groups, status, addRule, deleteRule, toggleBatch, deleteBatch, moveBatchToGroup };
};
