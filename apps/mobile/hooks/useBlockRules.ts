import { useState, useEffect } from "react";
import { collection, onSnapshot, writeBatch, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";
import { ruleSchema, ruleGroupSchema, validateAgainstSchema } from "@mindful-block/shared";

export const useBlockRules = (user: any) => {
  const [rules, setRules] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([{ id: "general", name: "General", is_system: true }]);
  const [status, setStatus] = useState("Initializing...");

  // Sync Rules from Firebase
  useEffect(() => {
    if (!user || !isCloudReady || !db || user.uid === "local-user") return;

    const rulesUnsub = onSnapshot(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRules(data);
      setStatus("Synced with Cloud");
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
  }, [user]);

  const toggleBatch = async (ids: string[], targetStatus: boolean) => {
    if (!user || ids.length === 0 || !isCloudReady) return;
    
    const batch = writeBatch(db);
    ids.forEach((id) => {
      const ref = doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id);
      batch.update(ref, { is_active: targetStatus, updated_at: serverTimestamp() });
    });
    await batch.commit();
  };
  
  const toggleRule = (id: string, currentStatus: boolean) => toggleBatch([id], !currentStatus);

  return {
    rules,
    groups,
    status,
    toggleRule,
    toggleBatch,
  };
};
