/** Location: /backend/firebase/functions/index.js **/
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Cloud Function: Tự động chuẩn hóa domain và tăng số phiên bản (v)
 * Đã được định dạng để vượt qua kiểm tra ESLint (max-len, spacing).
 */
exports.normalizeRule = onDocumentCreated("artifacts/{appId}/users/{userId}/block_configs/{docId}", async (event) => {
  const data = event.data.data();
  if (!data.domain || data.normalized) return;

  try {
    let domain = data.domain.toLowerCase().trim();

    if (domain.includes("/")) {
      const urlStr = domain.startsWith("http") ? domain : `https://${domain}`;
      domain = new URL(urlStr).hostname;
    }
    domain = domain.replace("www.", "");

    return event.data.ref.update({
      domain: domain,
      normalized: true,
      v: admin.firestore.FieldValue.increment(1),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("Lỗi chuẩn hóa:", e);
  }
});
