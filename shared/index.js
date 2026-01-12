export const APP_CONSTANTS = {
  APP_NAME: "MindfulBlock",
  VERSION: "1.0.0",
};
const ruleSchema = require("./schemas/rule.json");
const ruleGroupSchema = require("./schemas/ruleGroup.json");

// Export them so other packages can use them
module.exports = {
  ruleSchema,
  ruleGroupSchema,
  // You can also add constants here later
  CONSTANTS: {
    APP_NAME: "MindfulBlock",
  },
};
