export const getValueByPath = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((value, key) => {
    if (value === undefined || value === null) return "";
    return value[key];
  }, obj);
};

const normalizeSortValue = (value) => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(" ").toString().toLowerCase();
  if (typeof value === "object") return JSON.stringify(value).toLowerCase();
  const stringValue = value.toString();
  if (!Number.isNaN(Number(stringValue)) && stringValue.trim() !== "") {
    return Number(stringValue);
  }
  const dateValue = Date.parse(stringValue);
  if (!Number.isNaN(dateValue) && stringValue.length >= 4) {
    return dateValue;
  }
  return stringValue.toLowerCase();
};

export const sortItems = (items, sortBy) => {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    const aValue = normalizeSortValue(getValueByPath(a, sortBy));
    const bValue = normalizeSortValue(getValueByPath(b, sortBy));
    if (aValue === bValue) return 0;
    if (typeof aValue === "number" && typeof bValue === "number") return aValue - bValue;
    return aValue < bValue ? -1 : 1;
  });
};

export const filterItemsBySearch = (items, search) => {
  if (!search) return items;
  const needle = search.toLowerCase();
  return items.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    return haystack.includes(needle);
  });
};
