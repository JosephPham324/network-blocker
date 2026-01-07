/** Location: /backend/firebase/functions/index.js **/
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

exports.normalizeRule = onDocumentCreated("artifacts/{appId}/users/{userId}/block_configs/{docId}", async (event) => {
  const data = event.data.data();
  if (!data.domain || data.normalized) return;

  try {
    let domain = data.domain.toLowerCase().trim();
    if (domain.includes("/")) {
      domain = new URL(domain.startsWith("http") ? domain : `https://${domain}`).hostname;
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
