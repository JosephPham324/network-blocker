import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, appId, isCloudReady } from "../services/firebase";
import { callRust } from "../services/tauri";

export const useBlockRules = (user, setIsAdmin) => {
  const [rules, setRules] = useState([]);
  const [status, setStatus] = useState("Đang khởi tạo...");

  // Sync Rules from Firestore & Apply to Rust
  useEffect(() => {
    if (!user || !isCloudReady || !db) {
      // Local Mock Logic if cloud fails
      if (!isCloudReady) setStatus("Chế độ Local (Thiếu cấu hình Cloud)");
      return;
    }

    const path = `artifacts/${appId}/users/${user.uid}/block_configs`;

    return onSnapshot(
      collection(db, path),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRules(data);
        setStatus("Đang đồng bộ hệ thống...");

        const formatted = data.map((r) => ({ domain: r.domain, is_active: r.is_active }));

        callRust("apply_blocking_rules", { rules: formatted })
          .then(() => setStatus("Bảo vệ đang bật"))
          .catch((err) => {
            if (String(err).includes("ADMIN")) setIsAdmin(false);
            setStatus("Lỗi hệ thống");
          });
      },
      (err) => {
        console.error("Firestore Error:", err);
        setStatus("Lỗi kết nối Cloud");
      }
    );
  }, [user, setIsAdmin]);

  const addRule = async (newDomain) => {
    if (!newDomain || !user) return;
    const cleanDomain = newDomain.toLowerCase().trim().replace("www.", "");

    if (isCloudReady) {
      try {
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/block_configs`), {
          domain: cleanDomain,
          is_active: true,
          mode: "HARD",
          v: 1,
          updated_at: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setRules([...rules, { id: Date.now(), domain: cleanDomain, is_active: true }]);
    }
  };

  const deleteRule = async (id) => {
    if (!user) return;
    if (isCloudReady) {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/block_configs`, id));
      } catch (e) {
        console.error(e);
      }
    } else {
      setRules(rules.filter((r) => r.id !== id));
    }
  };

  return { rules, status, addRule, deleteRule };
};
