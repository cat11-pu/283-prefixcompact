// lcp.js：最长公共前缀与块头
export function commonPrefix(left, right) {
  const a = String(left);
  const b = String(right);
  const limit = Math.min(a.length, b.length);
  let end = 0;
  while (end < limit && a[end] === b[end]) {
    end += 1;
  }
  return a.slice(0, end);
}

export function blockPrefix(rows) {
  if (!rows || rows.length === 0) {
    return "";
  }
  let prefix = String(rows[0]);
  for (let spot = 1; spot < rows.length; spot += 1) {
    prefix = commonPrefix(prefix, rows[spot]);
    if (prefix === "") {
      break;
    }
  }
  return prefix;
}
