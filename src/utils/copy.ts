import { JsonObject, JsonValue } from "./types";

export const jsonToTableData = (
  data: JsonObject
): { key: string; value: JsonValue }[] => {
  const tableData: { key: string; value: JsonValue }[] = [];

  const flattenObject = (obj: JsonObject, prefix = "") => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        // Recursively flatten the object if it's an object or array
        if (typeof value === "object" && value !== null) {
          flattenObject(value as JsonObject, newKey);
        } else {
          tableData.push({ key: newKey, value: value });
        }
      }
    }
  };

  flattenObject(data);
  return tableData;
};
