import { invoke } from "@tauri-apps/api/core";

export const callRust = async (cmd, args = {}) => {
  // In Tauri v2, we check if we are in the Tauri environment by checking if window.__TAURI_INTERNALS__ exists
  // OR we can just rely on the fact that invoke will likely fail or do nothing in browser.
  // However, the standard way in v2 with the API package is to just use it. 
  // If we want to mock in browser, we can check `window.__TAURI_INTERNALS__` (standard for v2 detection)
  
  const isTauri = !!(window.__TAURI_INTERNALS__);

  if (isTauri) {
    try {
      return await invoke(cmd, args);
    } catch (e) {
      console.error(`Rust Error (${cmd}):`, e);
      throw e;
    }
  }
  
  console.log(`[Mock Mode] Executing ${cmd}`, args);
  return "MOCK_SUCCESS";
};
