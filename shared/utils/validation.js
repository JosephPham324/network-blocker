export const validateAgainstSchema = (data, schema) => {
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
