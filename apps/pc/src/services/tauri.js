export const callRust = async (cmd, args = {}) => {
  if (window.__TAURI__) {
    try {
      return await window.__TAURI__.tauri.invoke(cmd, args);
    } catch (e) {
      console.error(`Rust Error (${cmd}):`, e);
      throw e;
    }
  }
  console.log(`[Mock Mode] Executing ${cmd}`, args);
  return "MOCK_SUCCESS";
};
