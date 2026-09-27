// lcp.js：最长公共前缀与块头
export function commonPrefix(left, right) {
  const end = Math.min(left.length, right.length);
  let i = 0;
  while (i < end && left.charCodeAt(i) === right.charCodeAt(i)) i += 1;
  return left.slice(0, i);
}

export function blockPrefix(rows) {
  if (!rows || rows.length === 0) return "";
  let prefix = rows[0];
  for (let i = 1; i < rows.length; i += 1) {
    prefix = commonPrefix(prefix, rows[i]);
    if (prefix === "") break;
  }
  return prefix;
}
