export default {
  type: "object",
  properties: {
    title: "BlockGroup",
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      color: { type: "string", description: "Optional: Hex code for UI" },
      is_system: { type: "boolean", default: false, description: "If true, cannot be deleted (e.g., General)" },
    },
  },
};
